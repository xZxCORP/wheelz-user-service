import { z } from 'zod'

export const basicResponseSchema = z.object({
  message: z.string(),
  data: z.unknown().optional(),
})
