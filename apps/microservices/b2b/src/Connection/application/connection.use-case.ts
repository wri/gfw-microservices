import { Injectable } from '@nestjs/common';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { ConnectionStatus } from '../domain/connection';
import { ConnectionRepository } from '../domain/connection.repository';
import { ConnectionDataMapper } from './connection.mapper';
import {
  ConnectionAcceptHttpDto,
  ConnectionChangeDto,
} from './dtos/connection-status.dto';
import { ConnectionFiltersDto } from './dtos/connection-filters.dto';
import { ConnectionGetDto } from './dtos/connection-get.dto';
import { ConnectionAdminOrganizationDto } from './dtos/connection-admin-organizations.dto';

@Injectable()
export class ConnectionUseCases {
  constructor(
    private connectionRepo: ConnectionRepository,
    private mapper: ConnectionDataMapper,
  ) {}

  async getConnections(
    filtersDto: ConnectionFiltersDto,
  ): ResultPromise<ConnectionGetDto[]> {
    const connectionsRes = await this.connectionRepo.getConnections(filtersDto);
    if (connectionsRes.isSuccess) {
      const connections = connectionsRes.getValue();
      const connectionsGetDto: ConnectionGetDto[] = connections.map(
        (connection) => this.mapper.connectionToGetDto(connection),
      );
      return Result.ok(connectionsGetDto);
    }
    return Result.fail(connectionsRes.getError());
  }

  async acceptConnection(
    id: number,
    acceptConnectionHttpDto: ConnectionAcceptHttpDto,
  ): ResultPromise<boolean> {
    const changeStatusDto: ConnectionChangeDto = {
      editEmail: acceptConnectionHttpDto.editEmail,
      id,
      status: ConnectionStatus.accepted,
    };
    const result = await this.connectionRepo.acceptConnection(changeStatusDto);
    if (result.isSuccess) return Result.ok(true);
    return Result.fail(result.getError());
  }

  async getOrganizationsByUser(
    email: string,
  ): ResultPromise<ConnectionAdminOrganizationDto[]> {
    const result = await this.connectionRepo.getUserAdminOrganization(email);
    if (result.isSuccess) return Result.ok(result.getValue());
    return Result.fail(result.getError());
  }
}
