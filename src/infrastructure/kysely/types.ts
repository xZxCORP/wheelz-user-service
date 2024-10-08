import {
  type ColumnType,
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable,
} from 'kysely';

export interface Database {
  user: UserTable;
}

export interface UserTable {
  id: Generated<number>;
  firstname: ColumnType<string>;
  lastname: ColumnType<string>;
  email: ColumnType<string>;
  created_at: ColumnType<Date, never, never>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
