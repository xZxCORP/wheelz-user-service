import { promises as fs } from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import { FileMigrationProvider, Migrator } from 'kysely';

import { database, ensureDatabaseExists } from '../database.js';

const migrateDown = async () => {
  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dirname, '../migrations'),
    }),
  });

  const { error, results } = await migrator.migrateDown();

  if (error) {
    console.error(chalk.red('Migration failed:'), error);
    throw error;
  }

  if (results && results.length > 0) {
    for (const it of results) {
      if (it.status === 'Success') {
        console.log(chalk.green(`Migration "${it.migrationName}" rolled back successfully`));
      } else if (it.status === 'Error') {
        console.error(chalk.red(`Failed to roll back migration "${it.migrationName}":`));
      }
    }
  } else {
    console.log(chalk.blue('No migrations to roll back'));
  }

  await database.destroy();
};

try {
  await ensureDatabaseExists();
  await migrateDown();
  console.log(chalk.green('Rollbacks completed successfully.'));
} catch (error) {
  console.error(chalk.red('An error occurred during migration:'), error);
  throw error;
}
