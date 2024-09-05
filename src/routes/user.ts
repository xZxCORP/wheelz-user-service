import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { NewUser, UserUpdate } from '../infrastructure/kysely/types.js'
import newUserSchema from '../schema/user/user-create.schema.js'
import userResponseSchema from '../schema/user/user-response.schema.js'
import updateUserSchema from '../schema/user/user-update.schema.js'
import usersResponseSchema from '../schema/user/users-response.schema.js'
import { UserService } from '../services/user.js'

const userService = new UserService()
const userRouter = new Hono()

userRouter.get('/users', async (c) => {
  const response = await userService.index()
  const parsedResponse = usersResponseSchema.parse({ users: response })
  return c.json({ data: parsedResponse })
})

userRouter
  .get('/user/:id', async (c) => {
    const userId: number = Number.parseInt(c.req.param('id'))

    const response = await userService.show(userId)

    if (response.length === 0) {
      throw new HTTPException(404, { message: 'No user' })
    }

    const parsedResponse = userResponseSchema.parse(response[0])

    return c.json({ data: parsedResponse })
  })
  .patch(async (c) => {
    const userId: number = Number.parseInt(c.req.param('id'))
    const userParameters: UserUpdate = updateUserSchema.parse(await c.req.json())

    const user = await userService.show(userId)

    if (user.length === 0) {
      throw new HTTPException(404, { message: 'No user' })
    }

    userService.update(userId, userParameters)
    return c.json({ message: 'User Updated' })
  })
  .delete(async (c) => {
    const userId: number = Number.parseInt(c.req.param('id'))

    const user = await userService.show(userId)

    if (user.length === 0) {
      throw new HTTPException(404, { message: 'No user' })
    }

    await userService.destroy(userId)
    return c.json({ message: 'User deleted' })
  })

userRouter.post('/user', async (c) => {
  const userParameters: NewUser = newUserSchema.parse(await c.req.json())

  const user = await userService.findUserByEmail(userParameters.email!)
  if (user.length > 0) {
    throw new HTTPException(400, { message: 'Email already exists' })
  }

  await userService.create(userParameters)
  return c.json({ message: 'User created' }, 201)
})

export { userRouter }
