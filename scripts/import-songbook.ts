import {readFile} from 'node:fs/promises';
import nextEnv from '@next/env';
import {neon} from '@neondatabase/serverless';
import {IMPORT_SQL,importRows} from '../db/backup';
nextEnv.loadEnvConfig(process.cwd());
const dryRun=process.argv.includes('--dry-run');
const files=process.argv.slice(2).filter(a=>a!=='--dry-run');
if(!files.length)throw new Error('Usage: npm run db:import -- backup.json [another-backup.json] [--dry-run]');
try{
  const rows=importRows(await Promise.all(files.map(async file=>JSON.parse(await readFile(file,'utf8')))));
  if(dryRun)console.log(`Validated ${rows.length} saved records, including ${rows.filter(r=>r.deleted).length} deletions. No database writes made.`);
  else{
    if(!process.env.DATABASE_URL)throw new Error('Database not configured');
    const sql=neon(process.env.DATABASE_URL);
    if(rows.length)await sql.transaction(rows.map(row=>sql.query(IMPORT_SQL,[row.owner,row.id,row.data,row.deleted,row.updated_at])));
    console.log(`Import complete: ${rows.length} records checked. Existing records with the same or newer timestamp were preserved.`);
  }
}catch{console.error('Import failed. Check the backup format, database connection and migrations. No partial import was applied.');process.exitCode=1}
