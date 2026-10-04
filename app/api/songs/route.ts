import {songStore} from '../../../db/song-store';
import {songSchema} from '../../../lib/song-schema';
import {canEdit,sameOrigin} from '../../../lib/auth';
export const dynamic='force-dynamic';
export const runtime='nodejs';

function failure(){return Response.json({error:'Your songbook could not be saved or loaded. Please try again; your edits are still here.'},{status:503})}
function authorize(request:Request){
  if(!sameOrigin(request))return Response.json({error:'Request not allowed'},{status:403});
  if(!canEdit(request))return Response.json({error:'Log in to save changes to the songbook.'},{status:401});
}
export async function GET(){
  try{return Response.json({songs:await songStore().list()},{headers:{'Cache-Control':'no-store'}})}catch{return failure()}
}
export async function PUT(request:Request){
  const denied=authorize(request);if(denied)return denied;
  let data;try{const raw=await request.text();if(raw.length>150000)return Response.json({error:'This song sheet is too large.'},{status:413});data=songSchema.parse(JSON.parse(raw))}catch{return Response.json({error:'Check the song title, key and sheet format.'},{status:400})}
  try{return Response.json({song:await songStore().save(data)})}catch{return failure()}
}
export async function DELETE(request:Request){
  const denied=authorize(request);if(denied)return denied;
  const id=new URL(request.url).searchParams.get('id');
  if(!id||!songSchema.shape.id.safeParse(id).success)return Response.json({error:'Choose a song.'},{status:400});
  try{await songStore().remove(id);return Response.json({ok:true})}catch{return failure()}
}
