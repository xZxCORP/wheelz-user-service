import { z } from 'zod'

import userSchema from './user.schema.js'

const usersResponseSchema = z.object({
  data: z.array(userSchema),
})

export default usersResponseSchema
