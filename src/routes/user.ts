import { createRoute } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

import { honoApp } from '../infrastructure/hono/app.js'
import { basicResponseSchema } from '../schema/basic-response.schema.js'
import { idRequestSchema } from '../schema/id-request.schema.js'
import { UserSchema } from '../schema/user/user.schema.js'
import newUserSchema from '../schema/user/user-create.schema.js'
import userResponseSchema from '../schema/user/user-response.schema.js'
import updateUserSchema from '../schema/user/user-update.schema.js'
import usersResponseSchema from '../schema/user/users-response.schema.js'
import { UserService } from '../services/user.js'

const userService = new UserService()
const userRouter = honoApp()
// GET /users
userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: usersResponseSchema,
          },
        },
        description: 'List of users',
      },
    },
    tags: ['Users'],
  }),
  async (c) => {
    const users = await userService.index()
    const mappedUsers: UserSchema[] = users.map((user) => {
      return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        createdAt: user.created_at,
      }
    })
    return c.json({ data: mappedUsers }, 200)
  }
)

// POST /users
userRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    request: {
      body: {
        content: {
          'application/json': {
            schema: newUserSchema,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          'application/json': {
            schema: basicResponseSchema,
          },
        },
        description: 'User created successfully',
      },
      400: {
        content: {
          'application/json': {
            schema: basicResponseSchema,
          },
        },
        description: 'Bad request',
      },
    },
    tags: ['Users'],
  }),
  async (c) => {
    const body = c.req.valid('json')
    console.log(body)

    const existingUser = await userService.findUserByEmail(body.email)
    if (existingUser) {
      throw new HTTPException(400, { message: 'Email already exists' })
    }

    await userService.create(body)
    return c.json({ message: 'User created' }, 201)
  }
)

// GET /users/:id
userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{id}',
    request: {
      params: idRequestSchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: userResponseSchema,
          },
        },
        description: 'User details',
      },
      404: {
        content: {
          'application/json': {
            schema: basicResponseSchema,
          },
        },
        description: 'User not found',
      },
    },
    tags: ['Users'],
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const user = await userService.show(id)

    if (!user) {
      throw new HTTPException(404, { message: 'User not found' })
    }

    const mappedUser: UserSchema = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      createdAt: user.created_at,
    }

    return c.json({ data: mappedUser }, 200)
  }
)

// PATCH /users/:id
userRouter.openapi(
  createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
      params: idRequestSchema,
      body: {
        content: {
          'application/json': {
            schema: updateUserSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: basicResponseSchema,
          },
        },
        description: 'User updated successfully',
      },
      404: {
        content: {
          'application/json': {
            schema: basicResponseSchema,
          },
        },
        description: 'User not found',
      },
    },
    tags: ['Users'],
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const user = await userService.show(id)
    if (!user) {
      throw new HTTPException(404, { message: 'User not found' })
    }

    await userService.update(id, body)
    return c.json({ message: 'User updated' })
  }
)

// DELETE /users/:id
userRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
      params: idRequestSchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: basicResponseSchema,
          },
        },
        description: 'User deleted successfully',
      },
      404: {
        content: {
          'application/json': {
            schema: basicResponseSchema,
          },
        },
        description: 'User not found',
      },
    },
    tags: ['Users'],
  }),
  async (c) => {
    const { id } = c.req.valid('param')

    const user = await userService.show(id)
    if (!user) {
      throw new HTTPException(404, { message: 'User not found' })
    }

    await userService.destroy(id)
    return c.json({ message: 'User deleted' })
  }
)

export { userRouter }
