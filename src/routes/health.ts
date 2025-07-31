import { userContract } from '@zcorp/wheelz-contracts';

import { server } from '../server.js';
import { HealthService } from '../services/health.js';
const healthService = new HealthService();
export const healthRouter = server.router(userContract.health, {
  health: {
    handler: async () => {
      const databaseStatus = await healthService.checkDbHealth();
      return {
        status: 200,
        body: {
          status: 'healthy',
          services: [
            {
              name: 'user',
              status: 'healthy',
            },
            {
              name: 'db',
              status: databaseStatus ? 'healthy' : 'unhealthy',
            },
          ],
        },
      };
    },
  },
});
