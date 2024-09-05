import { database } from '../infrastructure/kysely/database.js'
import { NewUser, User, UserUpdate } from '../infrastructure/kysely/types.js'

export class UserService {
  async index() {
    const result: User[] = await database.selectFrom('user').selectAll().execute()
    return result
  }
  async show(id: number) {
    const result = await database
      .selectFrom('user')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()

    return result
  }
  async create(userParameters: NewUser) {
    const result = await database
      .insertInto('user')
      .values({ ...userParameters })
      .executeTakeFirst()
    return result
  }
  update(id: number, userParameters: UserUpdate) {
    const result = database
      .updateTable('user')
      .where('id', '=', id)
      .set(userParameters)
      .executeTakeFirst()

    return result
  }
  async destroy(id: number) {
    await database.deleteFrom('user').where('id', '=', id).executeTakeFirst()
  }
  async findUserByEmail(email: string) {
    const result = await database
      .selectFrom('user')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst()

    return result
  }
}
