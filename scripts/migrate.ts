import nextEnv from '@next/env';
import {neon} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-http';
import {migrate} from 'drizzle-orm/neon-http/migrator';
nextEnv.loadEnvConfig(process.cwd());
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL in .env.local before running migrations.');
try{
  await migrate(drizzle(neon(process.env.DATABASE_URL)),{migrationsFolder:'./drizzle'});
  console.log('Postgres migrations applied. Existing song records were preserved.');
}catch{console.error('Migration failed. Check the database connection and schema permissions.');process.exitCode=1}
