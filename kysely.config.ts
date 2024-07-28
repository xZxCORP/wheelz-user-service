import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl'

import { database } from './src/infrastructure/kysely/database.js'

export default defineConfig({
  kysely: database,
  migrations: {
    migrationFolder: 'src/infrastructure/kysely/migrations',
    getMigrationPrefix: () => {
      return getKnexTimestampPrefix().replace('_', '-')
    },
  },
})
