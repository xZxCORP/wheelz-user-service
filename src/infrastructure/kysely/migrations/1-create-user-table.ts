import { type Kysely, sql } from 'kysely'

import { Database } from '../types.js'

export const up = async (database: Kysely<Database>): Promise<void> => {
  await database.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('firstname', 'varchar(50)', (col) => col.notNull())
    .addColumn('lastname', 'varchar(50)', (col) => col.notNull())
    .addColumn('email', 'varchar(70)', (col) => col.notNull().unique())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export const down = async (database: Kysely<Database>): Promise<void> => {
  await database.schema.dropTable('user').execute()
}
