import {pgTable,text,integer,bigint,primaryKey} from 'drizzle-orm/pg-core';

export const songs=pgTable('songs',{
  owner:text('owner').notNull(), id:text('id').notNull(), data:text('data').notNull(),
  deleted:integer('deleted').notNull().default(0),
  updatedAt:bigint('updated_at',{mode:'number'}).notNull(),
},table=>[primaryKey({columns:[table.owner,table.id]})]);

// Persisted throttling works across independent Vercel function instances.
export const loginAttempts=pgTable('login_attempts',{
  id:text('id').primaryKey(), attempts:integer('attempts').notNull(),
  windowStart:bigint('window_start',{mode:'number'}).notNull(),
});
