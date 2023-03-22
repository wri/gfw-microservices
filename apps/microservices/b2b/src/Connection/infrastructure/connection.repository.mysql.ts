import { ConnectionRepository } from '../domain/connection.repository';
import { Connection } from '../domain/connection';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
import { ConnectionDataMapper } from '../application/connection.mapper';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { ConnectionFiltersDto } from '../application/dtos/connection-filters.dto';
import { ConnectionDbDto } from '../application/dtos/connection-db.dto';
import Result from '../../Shared/domain/result';
import { ConnectionChangeDto } from '../application/dtos/connection-status.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionRepositoryMysql
  extends RepositoryMysql
  implements ConnectionRepository
{
  constructor(private mapper: ConnectionDataMapper) {
    super();
  }

  async getConnections(
    filtersDto: ConnectionFiltersDto,
  ): ResultPromise<Connection[]> {
    const params = this.mapper.toGetProcedureParam(filtersDto);
    const createInvitation = this.storeProcedureFactory.create(
      'uspGetConnectionRequest',
      params,
    );
    let result = await createInvitation.execute<ConnectionDbDto[]>();
    if (result.isSuccess) {
      const connectionsDbDto = result.getValue();
      console.log(connectionsDbDto);
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

  async persistConnection(connection: Connection): Promise<void> {
    /*
    const params = this.mapper.toGetProcedureParam(connection);
    const saveConnection = this.storeProcedureFactory.create(
      'uspCreateConnectionRequest',
      params,
    );
    await saveConnection.execute();
    */
  }

  async acceptConnection(
    changeStatusDto: ConnectionChangeDto,
  ): ResultPromise<Number> {
    const params = this.mapper.toChangeStatusConnectionParam(changeStatusDto);
    const acceptConnection = this.storeProcedureFactory.create(
      'uspChangeConnectionRequestStatus',
      params,
    );
    return await acceptConnection.execute<number>();
  }

  async deleteConnection(id: string): Promise<void> {
    throw new Error('');
  }
}
