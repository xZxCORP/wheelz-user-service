import { z } from 'zod';

import userSchema from './user.schema.js';

const userResponseSchema = z.object({
  data: userSchema,
});
export type UserResponse = z.infer<typeof userResponseSchema>;
export default userResponseSchema;
