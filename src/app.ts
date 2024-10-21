import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { userContract } from '@zcorp/wheelz-contracts';
import Fastify from 'fastify';

import { openApiDocument } from './open-api.js';
import { userRouter } from './routes/user.js';
import { server } from './server.js';
export const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

app.setErrorHandler((error, _, reply) => {
  reply.status(error.statusCode ?? 500).send({ message: error.message, data: error.cause });
});
server.registerRouter(userContract.users, userRouter, app, {
  requestValidationErrorHandler(error, request, reply) {
    return reply.status(400).send({ message: 'Validation failed', data: error.body?.issues });
  },
});
app
  .register(fastifySwagger, {
    transformObject: () => openApiDocument,
  })
  .register(fastifySwaggerUI, {
    routePrefix: '/ui',
  });
