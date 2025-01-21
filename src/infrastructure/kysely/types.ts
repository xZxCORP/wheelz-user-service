import type {
  CompanySector,
  CompanySize,
  CompanyType,
  MembershipRole,
} from '@zcorp/wheelz-contracts';
import {
  type ColumnType,
  type Generated,
  type Insertable,
  type Selectable,
  type Updateable,
} from 'kysely';

export interface Database {
  user: UserTable;
  company: CompanyTable;
  membership: MembershipTable;
}

export interface UserTable {
  id: Generated<number>;
  firstname: ColumnType<string>;
  lastname: ColumnType<string>;
  email: ColumnType<string>;
  created_at: ColumnType<Date, never, never>;
}

export interface CompanyTable {
  id: Generated<number>;
  name: ColumnType<string>;
  country: ColumnType<string>;
  is_identified: ColumnType<boolean>;
  vat_number: ColumnType<string>;
  owner_id: ColumnType<number>;
  headquarters_address: ColumnType<string>;
  company_size: ColumnType<CompanySize>;
  company_type: ColumnType<CompanyType>;
  company_sector: ColumnType<CompanySector>;
  created_at: ColumnType<Date, never, never>;
}

export interface MembershipTable {
  id: Generated<number>;
  role: ColumnType<MembershipRole>;
  user_id: ColumnType<number>;
  company_id: ColumnType<number>;
  created_at: ColumnType<Date, never, never>;
}

//TODO: Appeler ça les type DB pour différencier des types 'API'
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Company = Selectable<CompanyTable>;
export type NewCompany = Insertable<CompanyTable>;
export type DatabaseCompanyUpdate = Updateable<CompanyTable>;

export type Membership = Selectable<MembershipTable>;
export type NewMembership = Insertable<MembershipTable>;
export type MembershipUpdate = Updateable<MembershipTable>;
