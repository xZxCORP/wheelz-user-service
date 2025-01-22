import { requireAuth } from '@zcorp/shared-fastify';
import { userContract } from '@zcorp/wheelz-contracts';
import type { FastifyRequest } from 'fastify';

import { server } from '../server.js';
import { roleClient } from '../services/role-external-service.js';
import { UserService } from '../services/user.js';

const userService = new UserService();

const isResourceOwner = async (request: FastifyRequest) => {
  const parameters = request.params as { id: string };
  if (!parameters || !parameters.id) {
    throw new Error("Identifiant de l'utilisateur non fourni");
  }
  const userId = Number(parameters.id);

  //TODO: add admin
  if (request.userId !== userId) {
    throw new Error('Non autorisé à accéder à cette ressource');
  }
};

export const userRouter = server.router(userContract.users, {
  createUser: {
    handler: async (input) => {
      const existingUser = await userService.findByEmail(input.body.email);
      if (existingUser) {
        return {
          status: 400,
          body: {
            message: 'User already exists',
          },
        };
      }
      const user = await userService.create(input.body);
      if (!user) {
        return {
          status: 500,
          body: {
            message: 'User not created',
          },
        };
      }

      const roleResponse = await roleClient.contract.getRoles({ params: { id: String(user.id) } });

      const roles = roleResponse.status === 200 ? roleResponse.body : null;

      return {
        status: 201,
        body: {
          data: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            createdAt: user.created_at,
            ...(roles && { roles }),
          },
        },
      };
    },
  },

  deleteUser: {
    hooks: {
      onRequest: [requireAuth(), isResourceOwner],
    },
    handler: async (input) => {
      const user = await userService.show(Number(input.params.id));
      if (!user) {
        return {
          status: 404,
          body: {
            message: 'User not found',
          },
        };
      }
      await userService.destroy(Number(input.params.id));
      return {
        status: 200,
        body: {
          message: 'User deleted',
        },
      };
    },
  },

  updateUser: {
    hooks: {
      onRequest: [requireAuth(), isResourceOwner],
    },
    handler: async (input) => {
      const userExists = await userService.show(Number(input.params.id));
      if (!userExists) {
        return {
          status: 404,
          body: {
            message: 'User not found',
          },
        };
      }
      const user = await userService.update(Number(input.params.id), input.body);
      if (!user) {
        return {
          status: 500,
          body: {
            message: 'User not updated',
          },
        };
      }
      return {
        status: 200,
        body: {
          message: 'User updated',
        },
      };
    },
  },

  getUsers: {
    handler: async (input) => {
      const users = await userService.index(input.query.email);
      const mappedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        createdAt: user.created_at,
      }));
      return {
        status: 200,
        body: {
          data: mappedUsers,
        },
      };
    },
  },

  // Obtenir un utilisateur par ID - Auth requise
  getUserById: {
    handler: async (input) => {
      const userId = input.params.id;
      const user = await userService.show(Number(userId));

      if (!user) {
        return {
          status: 404,
          body: {
            message: 'User not found',
          },
        };
      }

      const roleResponse = await roleClient.contract.getRoles({ params: { id: String(user.id) } });

      const roles = roleResponse.status === 200 ? roleResponse.body : null;

      return {
        status: 200,
        body: {
          data: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            createdAt: user.created_at,
            ...(roles && { roles }),
          },
        },
      };
    },
  },
});
