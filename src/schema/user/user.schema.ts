import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
});
export type UserSchema = z.infer<typeof userSchema>;

export default userSchema;
