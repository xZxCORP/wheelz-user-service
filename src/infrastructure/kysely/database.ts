import chalk from 'chalk';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { config } from '../../config.js';
import { type Database } from './types.js';

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    database: config.DB_NAME,
    host: config.DB_HOST,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    port: config.DB_PORT,
  }),
});

export const database = new Kysely<Database>({
  dialect,
});
export const ensureDatabaseExists = async () => {
  const client = new pg.Client({
    host: config.DB_HOST,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    port: config.DB_PORT,
    database: 'postgres',
  });
  await client.connect();
  try {
    const { rowCount } = await client.query(
      'SELECT datname FROM pg_catalog.pg_database WHERE datname = $1',
      [config.DB_NAME]
    );
    if (rowCount === 0) {
      console.log(chalk.yellow(`Database "${config.DB_NAME}" does not exist. Creating...`));
      await client.query('CREATE DATABASE $1', [config.DB_NAME]);
      console.log(chalk.green(`Database "${config.DB_NAME}" created successfully.`));
    } else {
      console.log(chalk.blue(`Database "${config.DB_NAME}" already exists.`));
    }
  } catch (error) {
    console.error(chalk.red('Error checking/creating database:', error));
    throw error;
  } finally {
    await client.end();
  }
};
