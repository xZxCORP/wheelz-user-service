import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { helloRouter } from './routes/hello.js'
import { userRouter } from './routes/user.js'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

export const app = new Hono();
app.use(logger());
app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({message: err.message}, err.status);
    } else if (err instanceof z.ZodError) {
        let errors: string[] = []
        err.issues.forEach((issue) => {
            errors.push(`${issue.path.join(', ')}: ${issue.message}`)
        })
        return c.json({message: { errors }}, 400);
    } else {
        return c.json({message: 'Server error' }, 500);
    }
});


app.route('/hello', helloRouter);
app.route('/', userRouter);

