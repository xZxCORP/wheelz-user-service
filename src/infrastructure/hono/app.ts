import { OpenAPIHono } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

export const honoApp = () =>
  new OpenAPIHono({
    defaultHook: (result) => {
      if (result.success) {
        return
      }
      const error = new HTTPException(422, {
        message: 'Validation failed',
      })
      error.cause = result.error.errors
      throw error
    },
  })
