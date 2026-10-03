import {getChatGPTUser} from '../../chatgpt-auth';
import {database} from '../../../db';
import {SEED} from '../../../lib/seed';
import {z} from 'zod';
export const dynamic='force-dynamic';
const schema=z.object({id:z.string().min(1).max(160).regex(/^[a-zA-Z0-9-]+$/),title:z.string().trim().min(1).max(160),artist:z.string().max(160),language:z.enum(['English','Sinhala']),key:z.string().regex(/^(?:[A-G][#b]?m?)?$/),content:z.string().max(100000),source:z.string().max(2000).refine(s=>!s||/^https?:\/\//.test(s),'Use an http or https link'),transpose:z.number().int().min(-48).max(48),favorite:z.boolean(),updatedAt:z.number().optional()});
function failure(error:unknown){console.error('Songbook storage:',error);return Response.json({error:'Your songbook could not be saved or loaded. Please try again; your edits are still here.'},{status:503});}
function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
export async function GET(){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in to load your songbook.'},{status:401});
 try{const {results}=await database().prepare('SELECT id, data, deleted FROM songs WHERE owner = ?').bind(user.userId).all<{id:string,data:string,deleted:number}>();
 const merged=new Map(SEED.map(s=>[s.id,s]));for(const row of results){if(row.deleted)merged.delete(row.id);else merged.set(row.id,JSON.parse(row.data));}
 return Response.json({songs:[...merged.values()]},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return failure(error)}
}
export async function PUT(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Request not allowed'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in to save your songs.'},{status:401});
 let data;try{const raw=await request.text();if(raw.length>150000)return Response.json({error:'This song sheet is too large.'},{status:413});data=schema.parse(JSON.parse(raw));}catch{return Response.json({error:'Check the song title, key and sheet format.'},{status:400})}
 try{const song={...data,updatedAt:Date.now()};await database().prepare('INSERT INTO songs (owner, id, data, deleted, updated_at) VALUES (?, ?, ?, 0, ?) ON CONFLICT(owner,id) DO UPDATE SET data=excluded.data, deleted=0, updated_at=excluded.updated_at').bind(user.userId,song.id,JSON.stringify(song),song.updatedAt).run();return Response.json({song});}catch(error){return failure(error)}
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Request not allowed'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in to update your songs.'},{status:401});
 const id=new URL(request.url).searchParams.get('id');if(!id||id.length>160)return Response.json({error:'Choose a song.'},{status:400});
 try{await database().prepare('INSERT INTO songs (owner, id, data, deleted, updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT(owner,id) DO UPDATE SET deleted=1, updated_at=excluded.updated_at').bind(user.userId,id,'{}',Date.now()).run();return Response.json({ok:true});}catch(error){return failure(error)}
}
