import { type Kysely, sql } from 'kysely'

import { Database } from '../types.js'

export async function up(database: Kysely<Database>): Promise<void> {
  await database.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(database: Kysely<Database>): Promise<void> {
  await database.schema.dropTable('user').execute()
}
