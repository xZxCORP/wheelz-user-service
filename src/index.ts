/* eslint-disable unicorn/no-process-exit */

import { app } from './app.js';
import { config } from './config.js';

const start = async () => {
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
