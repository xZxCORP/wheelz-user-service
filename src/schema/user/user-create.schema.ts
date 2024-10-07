import userSchema from './user.schema.js';

const newUserSchema = userSchema.pick({
  firstname: true,
  lastname: true,
  email: true,
});

export default newUserSchema;
