import {z} from 'zod';
import {songSchema} from '../lib/song-schema';

const rowSchema=z.object({
  owner:z.string().min(1).max(300),id:songSchema.shape.id,data:z.string().max(150000),
  deleted:z.coerce.number().int().min(0).max(1),updated_at:z.coerce.number().int().nonnegative().safe(),
});
const backupSchema=z.object({format:z.literal('chordroom-d1-v1'),rows:z.array(rowSchema).max(10000)});
export type BackupRow=z.infer<typeof rowSchema>;
export const IMPORT_SQL=`INSERT INTO songs (owner,id,data,deleted,updated_at) VALUES ($1,$2,$3,$4,$5)
  ON CONFLICT(owner,id) DO UPDATE SET data=excluded.data,deleted=excluded.deleted,updated_at=excluded.updated_at
  WHERE songs.updated_at < excluded.updated_at`;
export function importRows(backups:unknown[]):BackupRow[]{
  const merged=new Map<string,BackupRow>();
  for(const backup of backups){
    for(const row of backupSchema.parse(backup).rows){
      if(!row.deleted){
        const song=songSchema.parse(JSON.parse(row.data));
        if(song.id!==row.id)throw new Error('Backup song ID does not match its record');
        row.data=JSON.stringify(song);
      }
      const key=JSON.stringify([row.owner,row.id]);const old=merged.get(key);
      if(!old||row.updated_at>old.updated_at)merged.set(key,row);
    }
  }
  return [...merged.values()];
}
