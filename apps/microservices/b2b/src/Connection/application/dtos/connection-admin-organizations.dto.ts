import { UserAdminOrganization } from '@wri-monorepos/sql';

export class ConnectionAdminOrganizationDto {
  organizationId: number;
  organizationName: string;
}

export class ConnectionAdminOrganizationDbDto extends UserAdminOrganization {}
