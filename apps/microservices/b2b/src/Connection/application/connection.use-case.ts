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
import {
  ConnectionAcceptHttpDto,
  ConnectionChangeDto,
} from './dtos/connection-status.dto';
import { ConnectionDbDto } from './dtos/connection-db.dto';
import { ConnectionFiltersDto } from './dtos/connection-filters.dto';
import { ConnectionGetDto } from './dtos/connection-get.dto';

@Injectable()
export class ConnectionUseCases {
  constructor(
    private connectionRepo: ConnectionRepository,
    private mapper: ConnectionDataMapper,
  ) {}

  async createConnection(connectionDto: CreateConnectionDto): Promise<void> {
    /*const connection =
      ConnectionDataMapper.createConnectionDtotoConnection(connectionDto);
    return this.mapper.persistConnection(connection);*/
  }

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

  async deleteConnection(id: any): Promise<void> {
    //return this.mapper.deleteConnection(id);
  }
}
