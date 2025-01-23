import type { PaginatedUsers, PaginationParameters, User } from '@zcorp/wheelz-contracts';

import { database } from '../infrastructure/kysely/database.js';
import {
  type DatabaseNewUser,
  type DatabaseUser,
  type DatabaseUserUpdate,
} from '../infrastructure/kysely/types.js';

export class UserService {
  async index(paginationParameters: PaginationParameters, email?: string): Promise<PaginatedUsers> {
    const { count } = await database
      .selectFrom('user')
      .select(database.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow();
    let query = database.selectFrom('user').selectAll();
    if (email) {
      query = query.where('email', '=', email);
    }
    query = query
      .limit(paginationParameters.perPage)
      .offset((paginationParameters.page - 1) * paginationParameters.perPage);

    const result: DatabaseUser[] = await query.execute();

    const mappedUsers = result.map(
      (user): User => ({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        createdAt: user.created_at,
      })
    );

    return {
      items: mappedUsers,
      meta: {
        perPage: paginationParameters.perPage,
        page: paginationParameters.page,
        total: count,
      },
    };
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
