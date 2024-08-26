import { database } from "../infrastructure/kysely/database.js";
import { NewUser, User, UserUpdate } from "../infrastructure/kysely/types.js";

export class UserService {
    async index(): Promise<User[]> {
        const result: User[] = await database.selectFrom('user')
        .selectAll()
        .execute();
        return result;
    }
    async show(id: number) {
        const result = await database.selectFrom('user')
        .selectAll()
        .where('id', '=', id)
        .execute();

        return result;
    }
    async create(userParams: NewUser) {
        const result = await database.insertInto('user').values({ ...userParams }).executeTakeFirst();
        return result;
    }
    update(id: number, userParams: UserUpdate) {
        const result = database.updateTable('user')
        .where('id', '=', id)
        .set(userParams)
        .executeTakeFirst();

        return result;
    }
    async destroy(id: number) {
        await database.deleteFrom('user')
        .where('id', '=', id)
        .executeTakeFirst();

    }
    async findUserByEmail(email: string) {
        const result = await database.selectFrom('user')
        .selectAll()
        .where('email', '=', email)
        .execute();

        return result;
    }
}
