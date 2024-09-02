import { z } from "zod";
import userResponseSchema from "./user-response.schema.js";

const usersResponseSchema = z.object({
    users: z.array(userResponseSchema)
});

export default usersResponseSchema;
