import pg from 'pg';

import { config } from '../config.js';

export class HealthService {
  async checkDbHealth() {
    const client = new pg.Client({
      host: config.DB_HOST,
      user: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      port: config.DB_PORT,
      database: 'postgres',
    });

    await client.connect();
    const result = await client.query('SELECT 1');
    await client.end();

    return result.rowCount && result.rowCount > 0;
  }
}
