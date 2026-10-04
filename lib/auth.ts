import {createHash,createHmac,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {database,type Query} from '../db';

const scrypt=promisify(scryptCallback);
export const SESSION_COOKIE='chordroom-editor';
export const SESSION_SECONDS=60*60*24*7;
const WINDOW_MS=15*60*1000;

function config() {
  const username=process.env.AUTH_USERNAME;
  const hash=process.env.AUTH_PASSWORD_HASH;
  const secret=process.env.AUTH_SESSION_SECRET;
  if(!username||!hash||!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash)||!secret||secret.length<32)return null;
  return {username,hash,secret};
}
export function authConfigured(){return !!config()}
function equal(a:string,b:string){const left=createHash('sha256').update(a).digest();const right=createHash('sha256').update(b).digest();return timingSafeEqual(left,right)}

export async function verifyLogin(username:string,password:string) {
  const c=config();if(!c||password.length>256||username.length>160)return false;
  const [,salt,expected]=c.hash.split(':');
  const actual=await scrypt(password,salt,64) as Buffer;
  return timingSafeEqual(actual,Buffer.from(expected,'hex'))&&equal(username,c.username);
}
function signature(payload:string) {
  const c=config();if(!c)throw new Error('Editing is not configured');
  return createHmac('sha256',c.secret).update(c.username+'\n'+c.hash+'\n'+payload).digest('base64url');
}
export function createSession(now=Date.now()) {
  const payload=Buffer.from(JSON.stringify({exp:Math.floor(now/1000)+SESSION_SECONDS,nonce:randomBytes(16).toString('hex')})).toString('base64url');
  return payload+'.'+signature(payload);
}
export function validSession(token:string|undefined,now=Date.now()) {
  if(!config()||!token||token.length>1024)return false;
  const parts=token.split('.');if(parts.length!==2||!equal(parts[1],signature(parts[0])))return false;
  try{const {exp}=JSON.parse(Buffer.from(parts[0],'base64url').toString());return Number.isSafeInteger(exp)&&exp>Math.floor(now/1000)&&exp<=Math.floor(now/1000)+SESSION_SECONDS}catch{return false}
}
export function canEdit(request:Request) {
  const cookie=request.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(SESSION_COOKIE+'='));
  return validSession(cookie?.slice(SESSION_COOKIE.length+1));
}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin}

// A shared account has a single atomic limit: changing IP or username cannot bypass it.
export async function reserveLoginAttempt(query:Query=database(),now=Date.now()) {
  const rows=await query(`INSERT INTO login_attempts (id,attempts,window_start) VALUES ('editor',1,$1)
    ON CONFLICT(id) DO UPDATE SET
      attempts=CASE WHEN login_attempts.window_start <= $2 THEN 1 ELSE login_attempts.attempts+1 END,
      window_start=CASE WHEN login_attempts.window_start <= $2 THEN $1 ELSE login_attempts.window_start END
    WHERE login_attempts.window_start <= $2 OR login_attempts.attempts < 10
    RETURNING attempts`,[now,now-WINDOW_MS]);
  return rows.length>0;
}
