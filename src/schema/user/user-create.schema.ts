import { z } from "zod";

const newUserSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email()
});

export default newUserSchema;
