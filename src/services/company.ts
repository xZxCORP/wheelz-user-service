import { database } from "../infrastructure/kysely/database.js";

export class CompanyService {

	async index() {
		const result = await database.selectFrom('user').selectAll().execute();
		return result;
	};

	async show(id: number) {
		const result = await database
			.selectFrom('company')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst();

		return result;
	}
	async create() {};
	async update() {};
}
