import { promises as fs } from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import { FileMigrationProvider, Migrator } from 'kysely';

import { database, ensureDatabaseExists } from '../database.js';

const migrateToLatest = async () => {
  const migrator = new Migrator({
    db: database,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dirname, '../migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  if (error) {
    console.error(chalk.red('Migration failed:'), error);
    throw error;
  }

  if (results && results.length > 0) {
    for (const it of results) {
      if (it.status === 'Success') {
        console.log(chalk.green(`Migration "${it.migrationName}" executed successfully`));
      } else if (it.status === 'Error') {
        console.error(chalk.red(`Failed to execute migration "${it.migrationName}":`), it.status);
      }
    }
  } else {
    console.log(chalk.blue('No migrations to run'));
  }

  await database.destroy();
};

try {
  await ensureDatabaseExists();
  await migrateToLatest();
  console.log(chalk.green('Migrations completed successfully.'));
} catch (error) {
  console.error(chalk.red('An error occurred during migration:'), error);
  throw error;
}
