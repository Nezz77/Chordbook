import {writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import nextEnv from '@next/env';
import {database} from '../db';
nextEnv.loadEnvConfig(process.cwd());
const file=process.argv[2]||`backups/songbook-${new Date().toISOString().replaceAll(':','-')}.json`;
try{
  const rows=await database()('SELECT owner,id,data,deleted,updated_at FROM songs ORDER BY updated_at,owner,id');
  await mkdir(dirname(file),{recursive:true});
  await writeFile(file,JSON.stringify({format:'chordroom-d1-v1',exportedAt:new Date().toISOString(),rows},null,2),{mode:0o600,flag:'wx'});
  console.log(`Saved ${rows.length} records to ${file}. Keep this backup private.`);
}catch{console.error('Export failed. Check the database connection and choose a new output filename.');process.exitCode=1}
