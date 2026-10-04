import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {randomBytes,scryptSync} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {neonConfig} from '@neondatabase/serverless';
import {songStore} from '../db/song-store';
import {IMPORT_SQL,importRows} from '../db/backup';
import {SEED} from '../lib/seed';
import {createSession,validSession,verifyLogin,reserveLoginAttempt,SESSION_COOKIE} from '../lib/auth';
import * as songsRoute from '../app/api/songs/route';
import * as sessionRoute from '../app/api/session/route';

const pg=new PGlite();
const query=async(text:string,values:unknown[]=[]) => (await pg.query<Record<string,unknown>>(text,values)).rows;
const origin='https://chordbook.test';
const password='test-only-password-'+randomBytes(16).toString('hex');
const previousEnv={...process.env};
const previousFetch=neonConfig.fetchFunction;
let failDatabase=false;
before(async()=>{
  for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())await pg.exec(await readFile('drizzle/'+file,'utf8'));
  const salt=randomBytes(16).toString('hex');
  process.env.AUTH_USERNAME='test-editor';
  process.env.AUTH_PASSWORD_HASH=`scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;
  process.env.AUTH_SESSION_SECRET=randomBytes(32).toString('hex');
  process.env.DATABASE_URL='postgresql://test:test@database.example.test/test';
  // Exercise the real Neon adapter and route handlers, using an embedded Postgres engine.
  neonConfig.fetchFunction=async(_url:RequestInfo|URL,options?:RequestInit)=>{
    if(failDatabase)throw new Error('Test database outage');
    const {query:text,params}=JSON.parse(String(options?.body));
    const result=await pg.query<Record<string,unknown>>(text,params);
    const fields=result.fields.map(field=>({name:field.name,dataTypeID:field.dataTypeID}));
    return Response.json({fields,rows:result.rows.map(row=>fields.map(field=>row[field.name]===null?null:String(row[field.name])))});
  };
});
after(async()=>{neonConfig.fetchFunction=previousFetch;for(const key of Object.keys(process.env))if(!(key in previousEnv))delete process.env[key];Object.assign(process.env,previousEnv);await pg.close()});
function request(path:string,method:string,body?:unknown,cookie?:string,source=origin){
  return new Request(origin+path,{method,headers:{Origin:source,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
}
function cookieFor(token:string){return `${SESSION_COOKIE}=${token}`}
const fixture={...SEED[0],id:'migration-test',title:'Database test',content:'[C]Test [Am]sheet',key:'C',transpose:2,capo:4,favorite:true};

test('public reading, authenticated CRUD, invalid data, deletion and resurrection',async()=>{
  assert.equal((await songsRoute.GET()).status,200);
  assert.equal((await songsRoute.PUT(request('/api/songs','PUT',fixture))).status,401);
  assert.equal((await songsRoute.DELETE(request('/api/songs?id=good-to-be','DELETE'))).status,401);
  const cookie=cookieFor(createSession());
  assert.equal((await songsRoute.PUT(request('/api/songs','PUT',fixture,cookie,'https://other.test'))).status,403);
  assert.equal((await songsRoute.PUT(new Request(origin+'/api/songs',{method:'PUT',headers:{Cookie:cookie},body:JSON.stringify(fixture)}))).status,403);
  for(const capo of [-1,13,1.5])assert.equal((await songsRoute.PUT(request('/api/songs','PUT',{...fixture,capo},cookie))).status,400);
  const saved=await songsRoute.PUT(request('/api/songs','PUT',fixture,cookie));assert.equal(saved.status,200);
  const data=(await (await songsRoute.GET()).json()).songs.find((s:{id:string})=>s.id===fixture.id);
  assert.equal(data.content,fixture.content);assert.equal(data.capo,4);assert.equal(data.transpose,2);assert.equal(data.favorite,true);
  assert.equal((await songsRoute.DELETE(request('/api/songs?id='+fixture.id,'DELETE',undefined,cookie))).status,200);
  assert.ok(!(await songStore(query).list()).some(s=>s.id===fixture.id));
  assert.equal((await songsRoute.PUT(request('/api/songs','PUT',fixture,cookie))).status,200);
  await songStore(query).remove(SEED[0].id);assert.ok(!(await songStore(query).list()).some(s=>s.id===SEED[0].id));
  await songStore(query).save(SEED[0]);
});

test('login, tamper resistance, expiry, logout and secret rotation',async()=>{
  await query('DELETE FROM login_attempts');
  assert.ok(await verifyLogin('test-editor',password));
  assert.equal(await verifyLogin('test-editor','wrong'),false);
  assert.equal(await verifyLogin('other',password),false);
  assert.equal((await sessionRoute.POST(request('/api/session','POST',{username:'test-editor',password:'wrong'}))).status,401);
  const login=await sessionRoute.POST(request('/api/session','POST',{username:'test-editor',password}));
  assert.equal(login.status,200);const header=login.headers.get('set-cookie')!;
  assert.match(header,/HttpOnly/i);assert.match(header,/SameSite=strict/i);
  const cookie=header.split(';')[0];
  assert.equal((await sessionRoute.GET(request('/api/session','GET',undefined,cookie)).json()).canEdit,true);
  const token=createSession();assert.ok(validSession(token));assert.equal(validSession(token+'x'),false);
  assert.equal(validSession(createSession(Date.now()-8*24*60*60*1000)),false);
  const oldSecret=process.env.AUTH_SESSION_SECRET;process.env.AUTH_SESSION_SECRET=randomBytes(32).toString('hex');
  assert.equal(validSession(token),false);process.env.AUTH_SESSION_SECRET=oldSecret;
  const logout=sessionRoute.DELETE(request('/api/session','DELETE',undefined,cookie));assert.match(logout.headers.get('set-cookie')!,/Max-Age=0/i);
  assert.equal((await sessionRoute.GET(request('/api/session','GET')).json()).canEdit,false);
});

test('atomic login throttling survives new connections and expires',async()=>{
  await query('DELETE FROM login_attempts');const now=Date.now();
  const attempts=await Promise.all(Array.from({length:15},()=>reserveLoginAttempt(query,now)));
  assert.equal(attempts.filter(Boolean).length,10);
  const limited=await sessionRoute.POST(request('/api/session','POST',{username:'test-editor',password}));assert.equal(limited.status,429);
  assert.equal(await reserveLoginAttempt(query,now+15*60*1000),true);
});

test('backup import keeps newest changes and tombstones, is repeatable, validates before writing',async()=>{
  const song={...fixture,id:'imported'};
  const row={owner:'personal-songbook',id:song.id,data:JSON.stringify(song),deleted:0,updated_at:100};
  const backup=(rows:unknown[])=>({format:'chordroom-d1-v1',rows});
  const newer={...row,updated_at:200,data:JSON.stringify({...song,capo:7})};
  const rows=importRows([backup([row]),backup([newer])]);assert.equal(rows.length,1);assert.equal(rows[0].updated_at,200);
  for(const r of rows)await query(IMPORT_SQL,[r.owner,r.id,r.data,r.deleted,r.updated_at]);
  await query(IMPORT_SQL,[row.owner,row.id,row.data,0,100]);
  assert.equal((await songStore(query).list()).find(s=>s.id==='imported')?.capo,7);
  await query(IMPORT_SQL,[row.owner,row.id,'{}',1,300]);
  assert.ok(!(await songStore(query).list()).some(s=>s.id==='imported'));
  assert.throws(()=>importRows([backup([{...row,data:JSON.stringify({...song,id:'mismatch'})}])])) ;
  assert.throws(()=>importRows([backup([{...row,data:JSON.stringify({...song,capo:99})}])])) ;
  assert.equal(importRows([backup([{...row,deleted:1,data:'{}'}])]).length,1);
});

test('database outage and missing auth configuration fail closed',async()=>{
  failDatabase=true;
  assert.equal((await songsRoute.GET()).status,503);
  assert.equal((await songsRoute.PUT(request('/api/songs','PUT',fixture,cookieFor(createSession())))).status,503);
  assert.equal((await sessionRoute.POST(request('/api/session','POST',{username:'test-editor',password}))).status,503);
  failDatabase=false;
  const hash=process.env.AUTH_PASSWORD_HASH;delete process.env.AUTH_PASSWORD_HASH;
  assert.equal((await songsRoute.PUT(request('/api/songs','PUT',fixture))).status,401);
  assert.equal((await sessionRoute.POST(request('/api/session','POST',{username:'test-editor',password}))).status,503);
  process.env.AUTH_PASSWORD_HASH=hash;
});
