import { UserInfo } from '@wri-monorepos/sql';

// Preserve domain model
export class User extends UserInfo {}

export class UserOrganization {
  id: number;
  organizationDb: string;
  organizationStatusId: number;
  organizationName: string;
}
