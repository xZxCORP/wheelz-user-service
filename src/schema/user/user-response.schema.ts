import userSchema from './user.schema.js'

const userResponseSchema = userSchema.omit({
  id: true,
  created_at: true,
})

export default userResponseSchema
