import {readFile,writeFile,chmod} from 'node:fs/promises';
import {randomBytes,scryptSync} from 'node:crypto';
import {createInterface} from 'node:readline/promises';

if(!process.stdin.isTTY)throw new Error('Run this command in an interactive terminal.');
const prompt=createInterface({input:process.stdin,output:process.stdout});
const username=(await prompt.question('Editing username: ')).trim();prompt.close();
if(!username||username.length>160)throw new Error('Choose a username of 1–160 characters.');
function secretPrompt(label){
  process.stdout.write(label);process.stdin.setRawMode(true);process.stdin.resume();
  return new Promise((resolve,reject)=>{
    let password='';
    const finish=()=>{process.stdin.off('data',read);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n')};
    const read=chunk=>{for(const c of chunk.toString()){
      if(c==='\r'||c==='\n'){finish();resolve(password);return}
      if(c==='\u0003'){finish();reject(new Error('Cancelled'));return}
      if(c==='\u007f'||c==='\b'){password=password.slice(0,-1);continue}
      if(c>=' ')password+=c;
    }};
    process.stdin.on('data',read);
  });
}
const password=await secretPrompt('Editing password (hidden): ');
if(password.length<12||password.length>256)throw new Error('Use 12–256 characters.');
if(password!==await secretPrompt('Confirm password (hidden): '))throw new Error('Passwords did not match.');
const salt=randomBytes(16).toString('hex');
const hash=`scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;
let text=await readFile('.env.local','utf8').catch(e=>{if(e.code==='ENOENT')return 'DATABASE_URL=\n';throw e});
for(const [key,value] of Object.entries({AUTH_USERNAME:username,AUTH_PASSWORD_HASH:hash,AUTH_SESSION_SECRET:randomBytes(32).toString('hex')})){
  text=text.replace(new RegExp(`^${key}=.*(?:\\r?\\n|$)`,'gm'),'');
  text=text.trimEnd()+'\n'+key+'='+JSON.stringify(value)+'\n';
}
await writeFile('.env.local',text,{mode:0o600});await chmod('.env.local',0o600);
console.log('Saved private login settings to .env.local. Copy AUTH_USERNAME, AUTH_PASSWORD_HASH and AUTH_SESSION_SECRET into Vercel environment variables. Never commit this file.');
