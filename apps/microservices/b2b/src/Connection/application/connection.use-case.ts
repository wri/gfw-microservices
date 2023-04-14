import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { error } from 'console';
import { DataServices } from '../../Shared/domain/data-service';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { CreateConnectionDto } from '../application/dtos/connection.dto';
import { Connection, ConnectionStatus } from '../domain/connection';
import { ConnectionRepository } from '../domain/connection.repository';
import { ConnectionDataMapper } from './connection.mapper';
import { ConnectionChangeDto, ConnectionUpdateStatusHttpDto } from './dtos/connection-status.dto';
import { ConnectionDbDto } from './dtos/connection-db.dto';
import { ConnectionFiltersDto } from './dtos/connection-filters.dto';
import { ConnectionGetDto } from './dtos/connection-get.dto';
import { PromiseResult } from 'aws-sdk/lib/request';
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
    acceptConnectionHttpDto: ConnectionUpdateStatusHttpDto,
  ): ResultPromise<boolean> {
    const changeStatusDto: ConnectionChangeDto = {
      editEmail: acceptConnectionHttpDto.editEmail,
      id,
      status: ConnectionStatus.accepted,
    };
    const result = await this.connectionRepo.updateStatusConnection(changeStatusDto);
    if (result.isSuccess) return Result.ok(true);
    return Result.fail(result.getError());
  }

  async rejectConnection(
    id: number,
    rejectConnectionHttpDto: ConnectionUpdateStatusHttpDto,
  ): ResultPromise<boolean> {
    const changeStatusDto: ConnectionChangeDto = {
      editEmail: rejectConnectionHttpDto.editEmail,
      id,
      status: ConnectionStatus.rejected,
    };
    const result = await this.connectionRepo.updateStatusConnection(changeStatusDto);
    if (result.isSuccess) return Result.ok(true);
    return Result.fail(result.getError());
  }

  async cancelConnection(
    id: number,
    cancelConnectionHttpDto: ConnectionUpdateStatusHttpDto,
  ): ResultPromise<boolean> {
    const changeStatusDto: ConnectionChangeDto = {
      editEmail: cancelConnectionHttpDto.editEmail,
      id,
      status: ConnectionStatus.cancelled,
    };
    const result = await this.connectionRepo.updateStatusConnection(changeStatusDto);
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
