import type {
  Company,
  CompanyCreate,
  CompanyUpdate,
  CompanyWithUser,
  MembershipRole,
  PaginatedCompaniesWithUser,
  PaginationParameters,
  User,
} from '@zcorp/wheelz-contracts';

import { database } from '../infrastructure/kysely/database.js';
import type {
  DatabaseCompany,
  DatabaseCompanyUpdate,
  DatabaseNewCompany,
  DatabaseNewMembership,
  DatabaseUser,
} from '../infrastructure/kysely/types.js';
import { MembershipService } from './membership.js';
import { UserService } from './user.js';

export class CompanyService {
  private readonly userService: UserService;
  private readonly membershipService: MembershipService;

  constructor(userService: UserService, membershipService: MembershipService) {
    this.userService = userService;
    this.membershipService = membershipService;
  }

  async index(paginationParameters: PaginationParameters): Promise<PaginatedCompaniesWithUser> {
    const query = database.selectFrom('company');
    const {count} = await query.select(database.fn.countAll<number>().as('count')).executeTakeFirstOrThrow();

    const result = await query
      .selectAll()
      .limit(paginationParameters.perPage)
      .offset((paginationParameters.page - 1) * paginationParameters.perPage)
      .execute();

    const mappedEntities = await Promise.all(
      result.map(async (entity): Promise<CompanyWithUser> => {
        const mappedEntity = this.companyMapper(entity);

        const users = await database
          .selectFrom('user')
          .innerJoin('membership', 'user.id', 'membership.user_id')
          .where('membership.company_id', '=', entity.id)
          .select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
          .execute();

        const mappedUsers = await Promise.all(
          users.map(async (user): Promise<User & { membershipRole?: MembershipRole }> => {
            const membership = await this.membershipService.show(entity.id, user.id);

            const membershipRole = membership?.role;

            return this.userMapper(user, membershipRole);
          })
        );

        return { ...mappedEntity, users: mappedUsers };
      })
    );
    return {
      items: mappedEntities,
      meta: {
        page: paginationParameters.page,
        perPage: paginationParameters.perPage,
        total: count,
      },
    };
  }

  async show(id: number): Promise<CompanyWithUser | null> {
    const entity = await database
      .selectFrom('company')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!entity) {
      return null;
    }

    const mappedEntity = this.companyMapper(entity);

    const users = await database
      .selectFrom('user')
      .innerJoin('membership', 'user.id', 'membership.user_id')
      .where('membership.company_id', '=', entity.id)
      .select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
      .execute();

    const mappedUsers = await Promise.all(
      users.map(async (user): Promise<User & { membershipRole?: MembershipRole }> => {
        const membership = await this.membershipService.show(entity.id, user.id);

        const membershipRole = membership?.role;

        return this.userMapper(user, membershipRole);
      })
    );

    return { ...mappedEntity, users: mappedUsers };
  }

  async showByName(name: string): Promise<CompanyWithUser | null> {
    const entity = await database
      .selectFrom('company')
      .where('name', '=', name)
      .selectAll()
      .executeTakeFirst();

    if (!entity) {
      return null;
    }

    const mappedEntity = this.companyMapper(entity);

    const users = await database
      .selectFrom('user')
      .innerJoin('membership', 'user.id', 'membership.user_id')
      .where('membership.company_id', '=', entity.id)
      .select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
      .execute();

    const mappedUsers: User[] = users.map((user) => {
      return this.userMapper(user);
    });

    return { ...mappedEntity, users: mappedUsers };
  }

  async create(
    companyParameters: CompanyCreate,
    managerId: number
  ): Promise<(Company & { users: User[] }) | null> {
    const owner = await this.userService.show(managerId);

    if (!owner) {
      return null;
    }

    const mappedParameters: DatabaseNewCompany = {
      name: companyParameters.name,
      headquarters_address: companyParameters.headquartersAddress,
      vat_number: companyParameters.vatNumber,
      country: companyParameters.country,
      company_sector: companyParameters.companySector,
      company_size: companyParameters.companySize,
      company_type: companyParameters.companyType,
      is_identified: false,
      owner_id: owner.id,
    };

    const companyResult = await database
      .insertInto('company')
      .values({ ...mappedParameters })
      .returning('id')
      .executeTakeFirst();

    if (!companyResult || !companyResult.id) {
      return null;
    }

    const membershipParameter: DatabaseNewMembership = {
      role: 'manager',
      user_id: owner.id,
      company_id: companyResult.id,
    };

    await database
      .insertInto('membership')
      .values({ ...membershipParameter })
      .execute();

    return await this.show(companyResult.id);
  }

  async update(id: number, companyParameters: CompanyUpdate) {
    const mappedCompany: DatabaseCompanyUpdate = {
      name: companyParameters.name,
      company_sector: companyParameters.companySector,
      company_type: companyParameters.companyType,
      company_size: companyParameters.companySize,
      vat_number: companyParameters.vatNumber,
      country: companyParameters.country,
      headquarters_address: companyParameters.headquartersAddress,
    };

    await database
      .updateTable('company')
      .where('id', '=', id)
      .set(mappedCompany)
      .executeTakeFirst();

    return await this.show(id);
  }

  private companyMapper(entity: DatabaseCompany): Company {
    return {
      id: entity.id,
      name: entity.name,
      vatNumber: entity.vat_number,
      country: entity.country,
      companySector: entity.company_sector,
      companyType: entity.company_type,
      companySize: entity.company_size,
      isIdentified: entity.is_identified,
      createdAt: String(entity.created_at),
      ownerId: entity.owner_id,
      headquartersAddress: entity.headquarters_address,
    };
  }

  private userMapper(
    user: DatabaseUser,
    membershipRole?: MembershipRole
  ): User & { membershipRole?: MembershipRole } {
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      createdAt: user.created_at,
      membershipRole,
    };
  }
}
