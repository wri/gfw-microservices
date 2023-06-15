import { ParamStoreProcedure } from '../../Shared/infraestructure/mysql/store-procedure.params';
import * as sql from 'mssql';
import { GenericMapper } from '../../Shared/domain/mapper';
import { ConnectionAdminOrganizationDbDto } from '../../Connection/application/dtos/connection-admin-organizations.dto';
import { UserOrganization } from '../domain/user';

export class UserMapper extends GenericMapper {
  toEmailParam(email: string): ParamStoreProcedure[] {
    return [
      {
        field: 'userEmail',
        type: sql.NVarChar(50),
        value: email,
      },
    ];
  }

  toUserOrganization(
    dbDto: ConnectionAdminOrganizationDbDto,
  ): UserOrganization {
    return {
      id: dbDto.id,
      organizationDb: dbDto.organization_db,
      organizationStatusId: dbDto.organization_status_id,
      organizationName: dbDto.organization_name,
    };
  }

  toUserOrganizationArrayWrapper() {
    return this.arrayWrapper<
      ConnectionAdminOrganizationDbDto,
      UserOrganization
    >(this.toUserOrganization);
  }
}
