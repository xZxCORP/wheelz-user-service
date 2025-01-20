import type { Company, CompanyCreate, CompanyUpdate, CompanyWithUser, User } from "@zcorp/wheelz-contracts";
import { database } from "../infrastructure/kysely/database.js";
import type { NewCompany } from "../infrastructure/kysely/types.js";
import { UserService } from "./user.js";


const userService = new UserService();

export class CompanyService {

	async index(): Promise<CompanyWithUser[]> {
		const result = await database.selectFrom('company').selectAll().execute();

		const mappedEntities = await Promise.all(
			result.map(async (entity): Promise<CompanyWithUser> => {


				const mappedEntity : Company = {
					id: entity.id,
					name: entity.name,
					vatNumber: entity.vat_number,
					country: entity.country,
					companySector: entity.company_sector,
					companyType: entity.company_type,
					companySize: entity.company_size,
					isIdentified: entity.is_identified,
					createdAt: String(entity.created_at),
					managerId: entity.manager_id,
					headquartersAddress: entity.headquarters_address
				}

				const users = await database
					.selectFrom('user')
					.innerJoin('membership', 'user.id', 'membership.user_id')
					.where('membership.company_id', '=', entity.id)
					.select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
					.execute();


				const mappedUsers : User[] = users.map((user) => ({
					id: user.id,
					firstname: user.firstname,
					lastname: user.lastname,
					email: user.email,
					createdAt: user.created_at,
				}));


				return { ...mappedEntity, users: mappedUsers };
			})
		);
		return mappedEntities;
	};

	async show(id: number): Promise<CompanyWithUser | null> {
		const entity = await database
			.selectFrom('company')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst();


		if (!entity) {
			return null;
		}

		const mappedEntity : Company = {
			id: entity.id,
			name: entity.name,
			vatNumber: entity.vat_number,
			country: entity.country,
			companySector: entity.company_sector,
			companyType: entity.company_type,
			companySize: entity.company_size,
			isIdentified: entity.is_identified,
			createdAt: String(entity.created_at),
			managerId: entity.manager_id,
			headquartersAddress: entity.headquarters_address
		};


	const users = await database
	.selectFrom('user')
	.innerJoin('membership', 'user.id', 'membership.user_id')
	.where('membership.company_id', '=', entity.id)
	.select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
	.execute();


	const mappedUsers : User[] = users.map((user) => ({
		id: user.id,
		firstname: user.firstname,
		lastname: user.lastname,
		email: user.email,
		createdAt: user.created_at,
	}));

	return {...mappedEntity, users: mappedUsers };
	};

	async showByName(name: string): Promise<CompanyWithUser | null> {
		const entity = await database
		.selectFrom('company')
		.where('name', '=', name)
		.selectAll()
		.executeTakeFirst();

		if (!entity) {
			return null;
		}

		const mappedEntity : Company = {
			id: entity.id,
			name: entity.name,
			vatNumber: entity.vat_number,
			country: entity.country,
			companySector: entity.company_sector,
			companyType: entity.company_type,
			companySize: entity.company_size,
			isIdentified: entity.is_identified,
			createdAt: String(entity.created_at),
			managerId: entity.manager_id,
			headquartersAddress: entity.headquarters_address
		};


		const users = await database
		.selectFrom('user')
		.innerJoin('membership', 'user.id', 'membership.user_id')
		.where('membership.company_id', '=', entity.id)
		.select(['user.id', 'user.firstname', 'user.lastname', 'user.email', 'user.created_at'])
		.execute();


		const mappedUsers : User[] = users.map((user) => ({
			id: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
			email: user.email,
			createdAt: user.created_at,
		}));

		return {...mappedEntity, users: mappedUsers };
	};


	async create(companyParameters: CompanyCreate, managerId: number): Promise<(Company & { users: User[] }) | null>  {
		const owner = await userService.show(managerId)

		if (!owner) {
			return null;
		}

		const mappedParameters : NewCompany = {
			name: companyParameters.name,
			headquarters_address: companyParameters.headquartersAddress,
			vat_number: companyParameters.vatNumber,
			country: companyParameters.country,
			company_sector: companyParameters.companySector,
			company_size: companyParameters.companySize,
			company_type: companyParameters.companyType,
			is_identified: false,
			manager_id: owner.id
		}

		const result = await database
			.insertInto('company')
			.values({ ...mappedParameters })
			.executeTakeFirst();

		if (!result || !result.insertId) {
			return null;
		}

		const insertId = Number(result.insertId);

		return await this.show(insertId);
	};

	async update(id: number, companyParameters: CompanyUpdate) {
		await database
		.updateTable('company')
		.where('id', '=', id)
		.set(companyParameters)
		.executeTakeFirst();

	  return await this.show(id);
	};
}
