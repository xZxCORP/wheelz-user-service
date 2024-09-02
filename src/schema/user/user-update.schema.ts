import { z } from "zod";

const updateUserSchema = z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
});

export default updateUserSchema;
