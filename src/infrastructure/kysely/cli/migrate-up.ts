import { promises as fs } from 'node:fs'
import path from 'node:path'

import { FileMigrationProvider, Migrator } from 'kysely'

import { database } from '../database.js'

async function migrateToLatest() {
  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dirname, '../migrations'),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()
  if (error) {
    console.error('failed to migrate')
    console.error(error)
    throw error
  }

  if (results && results?.length > 0)
    for (const it of results) {
      if (it.status === 'Success') {
        console.log(`migration "${it.migrationName}" was executed successfully`)
      } else if (it.status === 'Error') {
        console.error(`failed to execute migration "${it.migrationName}"`)
      }
    }
  else {
    console.log('no migration to run')
  }

  await database.destroy()
}

await migrateToLatest()
