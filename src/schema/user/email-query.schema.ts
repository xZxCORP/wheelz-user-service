import { z } from 'zod'

const queryEmailSchema = z.string().email();

export type QueryEmailSchema = z.infer<typeof queryEmailSchema>;

export default queryEmailSchema;
