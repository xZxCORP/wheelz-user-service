import { userContract } from '@zcorp/wheelz-contracts';

import { server } from '../server.js';
import { UserService } from '../services/user.js';

const userService = new UserService();

export const userRouter = server.router(userContract, {
  async createUser(input) {
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
    return {
      status: 201,
      body: {
        data: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          createdAt: user.created_at,
        },
      },
    };
  },
  async deleteUser(input) {
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
  async updateUser(input) {
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
  async getUsers(input) {
    const users = await userService.index(input.query.email);
    const mappedUsers = users.map((user) => {
      return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        createdAt: user.created_at,
      };
    });
    return {
      status: 200,
      body: {
        data: mappedUsers,
      },
    };
  },
  async getUserById(input) {
    const user = await userService.show(Number(input.params.id));
    if (!user) {
      return {
        status: 404,
        body: {
          message: 'User not found',
        },
      };
    }
    return {
      status: 200,
      body: {
        data: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          createdAt: user.created_at,
        },
      },
    };
  },
});
