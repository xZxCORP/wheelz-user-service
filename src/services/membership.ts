import type { Membership } from '@zcorp/wheelz-contracts';

import { database } from '../infrastructure/kysely/database.js';

export class MembershipService {
  async show(companyId: number, userId: number): Promise<Membership | undefined> {
    const membership = await database
      .selectFrom('membership')
      .where('membership.user_id', '=', userId)
      .where('membership.company_id', '=', companyId)
      .selectAll()
      .executeTakeFirst();

    if (!membership) {
      return undefined;
    }

    const mappedMembership: Membership = {
      id: membership.id,
      role: membership.role,
      userId: membership.user_id,
      companyId: membership.company_id,
      createdAt: String(membership.created_at),
    };

    return mappedMembership;
  }
}
