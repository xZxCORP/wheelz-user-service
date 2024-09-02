import { z } from "zod";

const userResponseSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
});

export default userResponseSchema;
