import {database,type Query} from './index';
import {SEED} from '../lib/seed';
import {songSchema} from '../lib/song-schema';
import type {Song} from '../lib/music';

export const OWNER='personal-songbook';
export function songStore(query:Query=database()) {
  return {
    async list() {
      const rows=await query("SELECT id, data, deleted FROM songs ORDER BY updated_at ASC, CASE WHEN owner = 'personal-songbook' THEN 1 ELSE 0 END ASC, owner ASC");
      const merged=new Map<string,Song>(SEED.map(s=>[s.id,{...s}]));
      for(const row of rows) {
        if(Number(row.deleted)) merged.delete(String(row.id));
        else merged.set(String(row.id),songSchema.parse(JSON.parse(String(row.data))));
      }
      return [...merged.values()];
    },
    async save(data:Song) {
      const song={...songSchema.parse(data),updatedAt:Date.now()};
      await query(`INSERT INTO songs (owner,id,data,deleted,updated_at) VALUES ($1,$2,$3,0,$4)
        ON CONFLICT(owner,id) DO UPDATE SET data=excluded.data,deleted=0,updated_at=excluded.updated_at`,
        [OWNER,song.id,JSON.stringify(song),song.updatedAt]);
      return song;
    },
    async remove(id:string) {
      await query(`INSERT INTO songs (owner,id,data,deleted,updated_at) VALUES ($1,$2,'{}',1,$3)
        ON CONFLICT(owner,id) DO UPDATE SET deleted=1,updated_at=excluded.updated_at`,[OWNER,id,Date.now()]);
    },
  };
}
