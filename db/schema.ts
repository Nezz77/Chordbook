import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const songs=sqliteTable('songs',{
 owner:text('owner').notNull(),id:text('id').notNull(),data:text('data').notNull(),deleted:integer('deleted').notNull().default(0),updatedAt:integer('updated_at').notNull()
},table=>[primaryKey({columns:[table.owner,table.id]})]);
