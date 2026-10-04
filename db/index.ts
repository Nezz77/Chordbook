import {neon} from '@neondatabase/serverless';

export type Query = (text:string, values?:unknown[]) => Promise<Record<string, unknown>[]>;

// Connect lazily so builds and public pages do not require database credentials.
export function database(): Query {
  const url=process.env.DATABASE_URL;
  if(!url) throw new Error('DATABASE_URL is not configured');
  const sql=neon(url);
  return (text, values=[]) => sql.query(text, values, {fetchOptions:{signal:AbortSignal.timeout(12000)}});
}
