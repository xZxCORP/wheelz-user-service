import { z } from 'zod'

export const idRequestSchema = z.object({
  id: z.coerce.number(),
})
