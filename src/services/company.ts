import type {
  Company,
  CompanyCreate,
  CompanyUpdate,
  CompanyWithUser,
  MembershipRole,
  User,
} from '@zcorp/wheelz-contracts';

import { database } from '../infrastructure/kysely/database.js';
import type {
  DatabaseCompanyUpdate,
  NewCompany,
  NewMembership,
} from '../infrastructure/kysely/types.js';
import { MembershipService } from './membership.js';
import { UserService } from './user.js';

const userService = new UserService();
const membershipService = new MembershipService();

export class CompanyService {
  async index(): Promise<CompanyWithUser[]> {
    const result = await database.selectFrom('company').selectAll().execute();

    const mappedEntities = await Promise.all(
      result.map(async (entity): Promise<CompanyWithUser> => {
        const mappedEntity: Company = {
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

        const users = await database
          .selectFrom('user')
          .innerJoin('membership', 'user.id', 'membership.user_id')
          .where('membership.company_id', '=', entity.id)
          .select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
          .execute();

        const mappedUsers = await Promise.all(
          users.map(
            async (user): Promise<User & { membershipRole: MembershipRole | undefined }> => {
              const membership = await membershipService.show(entity.id, user.id);

              let membershipRole: MembershipRole | undefined;
              membershipRole = membership ? membership.role : undefined;

              const mappedUser = {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                createdAt: user.created_at,
                membershipRole: membershipRole,
              };

              return mappedUser;
            }
          )
        );

        return { ...mappedEntity, users: mappedUsers };
      })
    );
    return mappedEntities;
  }

  async show(id: number): Promise<CompanyWithUser | undefined> {
    const entity = await database
      .selectFrom('company')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!entity) {
      return undefined;
    }

    const mappedEntity: Company = {
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

    const users = await database
      .selectFrom('user')
      .innerJoin('membership', 'user.id', 'membership.user_id')
      .where('membership.company_id', '=', entity.id)
      .select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
      .execute();

    const mappedUsers = await Promise.all(
      users.map(async (user): Promise<User & { membershipRole: MembershipRole | undefined }> => {
        const membership = await membershipService.show(entity.id, user.id);

        let membershipRole: MembershipRole | undefined;
        membershipRole = membership ? membership.role : undefined;

        const mappedUser = {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          createdAt: user.created_at,
          membershipRole: membershipRole,
        };

        return mappedUser;
      })
    );

    return { ...mappedEntity, users: mappedUsers };
  }

  async showByName(name: string): Promise<CompanyWithUser | undefined> {
    const entity = await database
      .selectFrom('company')
      .where('name', '=', name)
      .selectAll()
      .executeTakeFirst();

    if (!entity) {
      return undefined;
    }

    const mappedEntity: Company = {
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

    const users = await database
      .selectFrom('user')
      .innerJoin('membership', 'user.id', 'membership.user_id')
      .where('membership.company_id', '=', entity.id)
      .select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
      .execute();

    const mappedUsers: User[] = users.map((user) => ({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      createdAt: user.created_at,
    }));

    return { ...mappedEntity, users: mappedUsers };
  }

  async create(
    companyParameters: CompanyCreate,
    managerId: number
  ): Promise<(Company & { users: User[] }) | undefined> {
    const owner = await userService.show(managerId);

    if (!owner) {
      return undefined;
    }

    const mappedParameters: NewCompany = {
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
      .executeTakeFirst();

    if (!companyResult || !companyResult.insertId) {
      return undefined;
    }

    const insertId = Number(companyResult.insertId);

    const membershipParameter: NewMembership = {
      role: 'manager',
      user_id: owner.id,
      company_id: insertId,
    };

    await database
      .insertInto('membership')
      .values({ ...membershipParameter })
      .execute();

    return await this.show(insertId);
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
}
