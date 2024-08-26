import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'

import { helloRouter } from './routes/hello.js'
import { userRouter } from './routes/user.js'

export const app = new Hono();
app.use(logger());

app.route('/hello', helloRouter);
app.route('/', userRouter);

app.onError((err, c) => {
    if (err instanceof HTTPException) {
        return err.getResponse()
    } else {
        return c.text('Internal Server Error', 500);
    }
});
