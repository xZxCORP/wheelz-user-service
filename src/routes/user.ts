import { Hono } from "hono";
import { UserService } from "../services/user.js";
import { NewUser, UserUpdate } from "../infrastructure/kysely/types.js";
import { HTTPException } from "hono/http-exception";

const userService = new UserService();
const userRouter = new Hono();

userRouter.get('/users', async (c) => {
    const response = await userService.index();
    return c.json({ users: response });
});

userRouter.get('/user/:id', async (c) => {
    try {
        const userId: number = parseInt(c.req.param('id'));

        const response = await userService.show(userId);

        if (response.length === 0) {
            throw new HTTPException(404, {message: 'No user'});
        }

        return c.json({ user: response });
    } catch (err) {
        if (!(err instanceof HTTPException)) {
            throw new HTTPException(500, { message: 'Internal Server Error' });
        }

        return err.getResponse();
    };
}).patch( async (c) => {
    try {
        const userId: number = parseInt(c.req.param('id'));
        const userParams: UserUpdate = await c.req.json()

        const user = await userService.show(userId);

        if (user.length === 0) {
            throw new HTTPException(404, {message: 'No user'});
        }

        userService.update(userId, userParams);
        return c.text("User Updated");
    } catch (err) {
        if (!(err instanceof HTTPException)) {
            throw new HTTPException(500, { message: 'Internal Server Error' });
        }

        return err.getResponse();
    }
}).delete(async (c) => {
    try {
        const userId: number = parseInt(c.req.param('id'));

        const user = await userService.show(userId);

        if (user.length === 0) {
            throw new HTTPException(404, {message: 'No user'});
        }

        await userService.destroy(userId);
        return c.text("User deleted");
    } catch(err) {
        return err.getResponse();
    }
});

userRouter.post('/user', async (c) => {
    try {
        const userParams: NewUser = await c.req.json();

        const user = await userService.findUserByEmail(userParams.email!);
        if (user.length > 0) {
            throw new HTTPException(400, { message: 'Email already exists' });
        }

        await userService.create(userParams);
        return c.text("User created", 201);
    } catch (err) {
        if (!(err instanceof HTTPException)) {
            throw new HTTPException(500, { message: 'Internal Server Error' });
        }

        return err.getResponse();
    }
});


export { userRouter };
