import { HTTPException } from 'hono/http-exception'
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

  async showByEmail(email: string) {
    const result = await database
    .selectFrom('user')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

    return result;
  }

  // Sous MySQL on n'a pas la possibilité d'utiliser returning donc on doit passer par cette propriété insertId
  async create(userParameters: NewUser): Promise<User> {
    const result = await database
      .insertInto('user')
      .values({ ...userParameters })
      .executeTakeFirst()

    if (!result || !result.insertId) {
      throw new HTTPException(500, {message: 'Insertion failed'});
    }

    // result.insertId est un BigInt on s'assure juste d'avoir un number
    const insertId = Number(result.insertId);

    const user = await database
    .selectFrom('user')
    .selectAll()
    .where('id', '=', insertId)
    .executeTakeFirstOrThrow();

    return user;
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
