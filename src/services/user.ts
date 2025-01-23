import { database } from '../infrastructure/kysely/database.js';
import {
  type DatabaseNewUser,
  type DatabaseUser,
  type DatabaseUserUpdate,
} from '../infrastructure/kysely/types.js';

export class UserService {
  async index(email?: string) {
    let query = database.selectFrom('user').selectAll();
    if (email) {
      query = query.where('email', '=', email);
    }
    const result: DatabaseUser[] = await query.execute();
    return result;
  }
  async findByEmail(email: string) {
    const result = await database
      .selectFrom('user')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return result;
  }
  async show(id: number) {
    const result = await database
      .selectFrom('user')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result;
  }

  async create(userParameters: DatabaseNewUser): Promise<DatabaseUser | null> {
    const result = await database
      .insertInto('user')
      .values({ ...userParameters })
      .returning('id')
      .executeTakeFirst();

    if (!result || !result.id) {
      return null;
    }

    const user = await database
      .selectFrom('user')
      .selectAll()
      .where('id', '=', result.id)
      .executeTakeFirstOrThrow();

    return user;
  }
  update(id: number, userParameters: DatabaseUserUpdate) {
    const result = database
      .updateTable('user')
      .where('id', '=', id)
      .set(userParameters)
      .executeTakeFirst();

    return result;
  }
  async destroy(id: number) {
    await database.deleteFrom('user').where('id', '=', id).executeTakeFirst();
  }
}
