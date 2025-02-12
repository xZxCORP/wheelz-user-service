import type {
  Company,
  PaginatedUsers,
  PaginationParameters,
  User,
  UserWithCompany,
} from '@zcorp/wheelz-contracts';

import { database } from '../infrastructure/kysely/database.js';
import {
  type DatabaseCompany,
  type DatabaseNewUser,
  type DatabaseUser,
  type DatabaseUserUpdate,
} from '../infrastructure/kysely/types.js';

export class UserService {
  async paginatedIndex(
    paginationParameters: PaginationParameters,
    email?: string
  ): Promise<PaginatedUsers> {
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
    const mappedUsers = await Promise.all(
      result.map(async (user): Promise<UserWithCompany> => {
        const company = await this.getCompanyOfUser(user.id);

        return this.mapUserWithCompany(user, company);
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
  async rawIndex(queryString?: string): Promise<User[]> {
    let query = database.selectFrom('user').selectAll();
    if (queryString) {
      query = query.where((eb) =>
        eb.or([
          eb('email', 'ilike', `%${queryString}%`),
          eb('firstname', 'ilike', `%${queryString}%`),
          eb('lastname', 'ilike', `%${queryString}%`),
        ])
      );
    }
    const result: DatabaseUser[] = await query.execute();
    const mappedUsers = await Promise.all(
      result.map(async (user): Promise<UserWithCompany> => {
        const company = await this.getCompanyOfUser(user.id);

        return this.mapUserWithCompany(user, company);
      })
    );
    return mappedUsers;
  }

  async findByEmail(email: string) {
    const result = await database
      .selectFrom('user')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    return result;
  }

  async show(id: number): Promise<UserWithCompany | null> {
    const user = await database
      .selectFrom('user')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    const company = await database
      .selectFrom('company')
      .selectAll('company')
      .innerJoin('membership', 'company.id', 'membership.company_id')
      .innerJoin('user', 'membership.user_id', 'user.id')
      .where('membership.user_id', '=', id)
      .executeTakeFirst();

    return this.mapUserWithCompany(user, company);
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
  getCompanyOfUser(id: number): Promise<DatabaseCompany | undefined> {
    return database
      .selectFrom('company')
      .selectAll('company')
      .innerJoin('membership', 'company.id', 'membership.company_id')
      .innerJoin('user', 'membership.user_id', 'user.id')
      .where('membership.user_id', '=', id)
      .executeTakeFirst();
  }
  private mapCompany(company: DatabaseCompany): Company {
    return {
      id: company.id,
      name: company.name,
      vatNumber: company.vat_number,
      headquartersAddress: company.headquarters_address,
      country: company.country,
      companySector: company.company_sector,
      companySize: company.company_size,
      companyType: company.company_type,
      isIdentified: company.is_identified,
      createdAt: String(company.created_at),
      ownerId: company.owner_id,
    };
  }
  private async mapUserWithCompany(
    user: DatabaseUser,
    company: DatabaseCompany | undefined
  ): Promise<UserWithCompany> {
    let mappedCompany = undefined;

    if (company) {
      mappedCompany = this.mapCompany(company);
    }

    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      createdAt: user.created_at,
      company: mappedCompany,
    };
  }
}
