import { type Kysely, sql } from 'kysely';

import { type Database } from '../types.js';

export const up = async (database: Kysely<Database>): Promise<void> => {
  await database.schema
    .createTable('company')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('company_size', 'varchar(10)', (col) => col.notNull())
    .addColumn('company_sector', 'varchar(30)', (col) => col.notNull())
    .addColumn('company_type', 'varchar(20)', (col) => col.notNull())
    .addColumn('country', 'varchar(100)', (col) => col.notNull())
    .addColumn('vat_number', 'varchar(20)', (col) => col.notNull())
    .addColumn('headquarters_address', 'varchar(200)', (col) => col.notNull())
    .addColumn('owner_id', 'integer', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await database.schema
    .createTable('membership')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('role', 'varchar(20)', (col) => col.notNull())
    .addColumn('user_id', 'serial', (col) =>
      col.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('company_id', 'serial', (col) =>
      col.references('company.id').onDelete('cascade').notNull()
    )
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
};

export const down = async (database: Kysely<Database>): Promise<void> => {
  await database.schema.dropTable('company').execute();
  await database.schema.dropTable('membership').execute();
};
