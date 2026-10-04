import {NextResponse} from 'next/server';
import {authConfigured,canEdit,createSession,reserveLoginAttempt,sameOrigin,SESSION_COOKIE,SESSION_SECONDS,verifyLogin} from '../../../lib/auth';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store'};

export function GET(request:Request){return NextResponse.json({canEdit:canEdit(request),configured:authConfigured()},{headers})}
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Request not allowed'},{status:403,headers});
  if(!authConfigured())return NextResponse.json({error:'Editing has not been set up yet.'},{status:503,headers});
  let username,password;
  try{
    const raw=await request.text();if(raw.length>2000)throw new Error();
    ({username,password}=JSON.parse(raw));
    if(typeof username!=='string'||typeof password!=='string'||username.length>160||password.length>256)throw new Error();
  }catch{return NextResponse.json({error:'Enter your username and password.'},{status:400,headers})}
  try{
    if(!await reserveLoginAttempt())return NextResponse.json({error:'Too many login attempts. Please try again in 15 minutes.'},{status:429,headers:{...headers,'Retry-After':'900'}});
    if(!await verifyLogin(username,password))return NextResponse.json({error:'The username or password is incorrect.'},{status:401,headers});
    const response=NextResponse.json({canEdit:true},{headers});
    response.cookies.set(SESSION_COOKIE,createSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:SESSION_SECONDS});
    return response;
  }catch{return NextResponse.json({error:'Login is unavailable right now. Please try again.'},{status:503,headers})}
}
export function DELETE(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Request not allowed'},{status:403,headers});
  const response=NextResponse.json({canEdit:false},{headers});
  response.cookies.set(SESSION_COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});
  return response;
}
