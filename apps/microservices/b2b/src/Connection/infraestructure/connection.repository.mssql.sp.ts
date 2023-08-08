import { ConnectionRepositorySP } from '../domain/connection.repository.sp';
import { Connection, ConnectionInvitation } from '../domain/connection';
import { RepositoryMssqlSP } from '../../Shared/infraestructure/mysql/repository.mysql';
import { ConnectionDataMapper } from '../application/connection.mapper';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { ConnectionFiltersDto } from '../application/dtos/connection-filters.dto';
import { ConnectionDbDto } from '../application/dtos/connection-db.dto';
import Result from '../../Shared/domain/result';
import { ConnectionChangeDto } from '../application/dtos/connection-status.dto';
import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectionAdminOrganizationDbDto,
  ConnectionAdminOrganizationDto,
} from '../application/dtos/connection-admin-organizations.dto';
import { DataSource } from 'typeorm';
import {
  ConnectionRequestStatus,
  CheckAndExpireConnections,
} from '@wri-monorepos/sql';

@Injectable()
export class ConnectionRepositoryMssqlSP
  extends RepositoryMssqlSP
  implements ConnectionRepositorySP
{
  public readonly logger = new Logger(ConnectionRepositoryMssqlSP.name);

  constructor(
    private mapper: ConnectionDataMapper,
    private dataSource: DataSource = null,
  ) {
    super(dataSource);
  }

  async resendConnection(id: number): ResultPromise<void> {
    const params = this.mapper.toIdParam(id);
    const resendInvitation = this.storeProcedureFactory.create(
      'resendInvitation',
      params,
    );
    return await resendInvitation.execute();
  }

  async createConnection(connectionInvitation: ConnectionInvitation) {
    const params =
      this.mapper.toCreateConnectionProcedureParam(connectionInvitation);
    const createInvitation = this.storeProcedureFactory.create(
      'setCreateConnectionRequest',
      params,
    );
    const result = await createInvitation.execute();
    return result;
  }

  async getUserAdminOrganization(
    email: string,
  ): ResultPromise<ConnectionAdminOrganizationDto[]> {
    const params = this.mapper.createStoreProcedureStringParam([
      ['email', email],
    ]);

    const getUserAdminOrganizations = this.storeProcedureFactory.create(
      'getUserAdminOrganizations',
      params,
    );

    const result =
      await getUserAdminOrganizations.getMany<ConnectionAdminOrganizationDbDto>();
    if (result.isSuccess) {
      const organizationsDbDto = result.getValue();
      let organizations = [];
      if (Array.isArray(organizationsDbDto)) {
        organizations = organizationsDbDto.map((organizationDbDto) =>
          this.mapper.toAdminOrganizationDto(organizationDbDto),
        );
      } else {
        organizationsDbDto &&
          organizations.push(
            this.mapper.toAdminOrganizationDto(organizationsDbDto),
          );
      }

      return Result.ok(organizations);
    }
    return Result.fail(result.getError());
  }

  async getConnections(
    filtersDto: ConnectionFiltersDto,
  ): ResultPromise<Connection[]> {
    const params = this.mapper.toGetProcedureParam(filtersDto);
    const createInvitation = this.storeProcedureFactory.create(
      'uspGetConnectionRequest',
      params,
    );

    const result = await createInvitation.getMany<ConnectionDbDto>();
    if (result.isSuccess) {
      const connectionsDbDto = result.getValue();

      let connections = [];
      if (Array.isArray(connectionsDbDto)) {
        connections = connectionsDbDto.map((connectionDbDto) =>
          this.mapper.dbDtotoConnection(connectionDbDto),
        );
      } else {
        connectionsDbDto &&
          connections.push(this.mapper.dbDtotoConnection(connectionsDbDto));
      }

      return Result.ok(connections);
    }
    return Result.fail(result.getError());
  }

  async updateStatusConnection(
    changeStatusDto: ConnectionChangeDto,
  ): ResultPromise<ConnectionRequestStatus> {
    const params = this.mapper.toChangeStatusConnectionParam(changeStatusDto);
    const updateStatusConnection = this.storeProcedureFactory.create(
      'uspChangeConnectionRequestStatus',
      params,
    );
    return await updateStatusConnection.execute<ConnectionRequestStatus>();
  }

  async checkAndExpireConnection(): ResultPromise<CheckAndExpireConnections> {
    const params = this.mapper.toEmptyParam();
    const updateStatusConnection = this.storeProcedureFactory.create(
      'uspGetCheckAndExpireConnection',
      params,
    );
    return await updateStatusConnection.execute<CheckAndExpireConnections>();
  }
}
