import { Hono } from "hono";
import { UserService } from "../services/user.js";
import { NewUser, UserUpdate } from "../infrastructure/kysely/types.js";
import { HTTPException } from "hono/http-exception";
import newUserSchema from "../schema/user/user-create.schema.js";
import updateUserSchema from "../schema/user/user-update.schema.js";
import usersResponseSchema from "../schema/user/users-response.schema.js";
import userResponseSchema from "../schema/user/user-response.schema.js";

const userService = new UserService();
const userRouter = new Hono();

userRouter.get('/users', async (c) => {
    const response = await userService.index();
    const parsedResponse = usersResponseSchema.parse({ users: response });
    return c.json({ data: parsedResponse });
});

userRouter.get('/user/:id', async (c) => {
    const userId: number = parseInt(c.req.param('id'));

    const response = await userService.show(userId);

    if (response.length === 0) {
        throw new HTTPException(404, {message: 'No user'});
    }

    const parsedResponse = userResponseSchema.parse(response[0]);

    return c.json({ data: parsedResponse });
}).patch( async (c) => {
    const userId: number = parseInt(c.req.param('id'));
    const userParams: UserUpdate = updateUserSchema.parse(await c.req.json());

    const user = await userService.show(userId);

    if (user.length === 0) {
        throw new HTTPException(404, {message: 'No user'});
    }

    userService.update(userId, userParams);
    return c.json({message: "User Updated"});
}).delete(async (c) => {
    const userId: number = parseInt(c.req.param('id'));

    const user = await userService.show(userId);

    if (user.length === 0) {
        throw new HTTPException(404, {message: 'No user'});
    }

    await userService.destroy(userId);
    return c.json({message: "User deleted"});
});

userRouter.post('/user', async (c) => {
    const userParams: NewUser = newUserSchema.parse(await c.req.json());

    const user = await userService.findUserByEmail(userParams.email!);
    if (user.length > 0) {
        throw new HTTPException(400, { message: 'Email already exists' });
    }

    await userService.create(userParams);
    return c.json( {message: "User created"}, 201);
});

export { userRouter };
