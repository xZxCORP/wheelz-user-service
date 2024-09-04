import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { z } from 'zod'

import { helloRouter } from './routes/hello.js'
import { userRouter } from './routes/user.js'

export const app = new Hono()
app.use(logger())
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ message: error.message }, error.status)
  } else if (error instanceof z.ZodError) {
    const errors: string[] = []
    for (const issue of error.issues) {
      errors.push(`${issue.path.join(', ')}: ${issue.message}`)
    }
    return c.json({ message: { errors } }, 400)
  } else {
    return c.json({ message: 'Server error' }, 500)
  }
})

app.route('/hello', helloRouter)
app.route('/', userRouter)
