import { initClient } from '@ts-rest/core';
import { roleContract } from '@zcorp/wheelz-contracts';

import { config } from '../config.js';

export const roleClient = initClient(roleContract, {
  baseUrl: config.AUTH_SERVICE_URL,
  baseHeaders: {
    'x-app-source': 'ts-rest',
  },
});
