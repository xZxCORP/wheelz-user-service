import userSchema from './user.schema.js'

const updateUserSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    email: true,
  })
  .partial({
    firstname: true,
    lastname: true,
  })

export default updateUserSchema
