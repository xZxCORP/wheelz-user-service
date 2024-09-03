import { z } from "zod";

const userSchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    created_at: z.string()
});

export default userSchema;
