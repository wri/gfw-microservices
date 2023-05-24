import { ConnectionRepository } from '../domain/connection.repository';
import { Connection } from '../domain/connection';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
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

@Injectable()
export class ConnectionRepositoryMysql
  extends RepositoryMysql
  implements ConnectionRepository
{
  public readonly logger = new Logger(ConnectionRepositoryMysql.name);

  constructor(private mapper: ConnectionDataMapper) {
    super();
  }

  async getUserAdminOrganization(
    email: string,
  ): ResultPromise<ConnectionAdminOrganizationDto[]> {
    const params = this.mapper.createStoreProcedureStringParam([
      ['email', email],
    ]);
    this.logger.debug(params);
    const getUserAdminOrganizations = this.storeProcedureFactory.create(
      'uspGetUserAdminOrganizations',
      params,
    );
    this.logger.debug(getUserAdminOrganizations);
    const result = await getUserAdminOrganizations.execute<
      ConnectionAdminOrganizationDbDto[]
    >();
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
    const result = await createInvitation.execute<ConnectionDbDto[]>();
    if (result.isSuccess) {
      const connectionsDbDto = result.getValue();
      this.logger.debug(connectionsDbDto);
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

  async acceptConnection(
    changeStatusDto: ConnectionChangeDto,
  ): ResultPromise<number> {
    const params = this.mapper.toChangeStatusConnectionParam(changeStatusDto);
    const acceptConnection = this.storeProcedureFactory.create(
      'uspChangeConnectionRequestStatus',
      params,
    );
    return await acceptConnection.execute<number>();
  }
}
