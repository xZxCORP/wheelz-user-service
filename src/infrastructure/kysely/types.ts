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
export type DatabaseUser = Selectable<UserTable>;
export type DatabaseNewUser = Insertable<UserTable>;
export type DatabaseUserUpdate = Updateable<UserTable>;

export type DatabaseCompany = Selectable<CompanyTable>;
export type DatabaseNewCompany = Insertable<CompanyTable>;
export type DatabaseCompanyUpdate = Updateable<CompanyTable>;

export type DatabaseMembership = Selectable<MembershipTable>;
export type DatabaseNewMembership = Insertable<MembershipTable>;
export type DatabaseMembershipUpdate = Updateable<MembershipTable>;
