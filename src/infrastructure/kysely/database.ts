import { Kysely, MysqlDialect } from 'kysely'
import { createPool } from 'mysql2'

import { config } from '../../config.js'
import { Database } from './types.js'

const dialect = new MysqlDialect({
  pool: createPool({
    database: config.DB_NAME,
    host: config.DB_HOST,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    port: config.DB_PORT,
  }),
})

export const database = new Kysely<Database>({
  dialect,
})
