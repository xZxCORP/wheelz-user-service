import { swaggerUI } from '@hono/swagger-ui'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { trimTrailingSlash } from 'hono/trailing-slash'

import { honoApp } from './infrastructure/hono/app.js'
import { userRouter } from './routes/user.js'

export const app = honoApp()
app.use(trimTrailingSlash())
app.use(logger())

app.onError((error, c) => {
  console.log(error)
  return error instanceof HTTPException
    ? c.json({ message: error.message, data: error.cause }, error.status)
    : c.json({ message: 'Server error' }, 500)
})
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Wheelz User API',
  },
})
app.route('/users', userRouter)
app.get('/ui', swaggerUI({ url: '/doc' }))
