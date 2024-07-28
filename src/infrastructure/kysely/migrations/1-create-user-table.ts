import { type Kysely, sql } from 'kysely'

import { Database } from '../types.js'

export const up = async (database: Kysely<Database>): Promise<void> => {
  await database.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export const down = async (database: Kysely<Database>): Promise<void> => {
  await database.schema.dropTable('user').execute()
}
