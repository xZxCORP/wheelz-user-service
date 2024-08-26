import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface Database {
  user: UserTable
}

export interface UserTable {
  id: Generated<number>
  firstname: ColumnType<string | undefined>
  lastname: ColumnType<string | undefined>
  email: ColumnType<string | undefined>
  created_at: ColumnType<Date, string | undefined, never>
}

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>
