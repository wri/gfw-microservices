import { plainToInstance } from 'class-transformer';
import * as sql from 'mssql';
import { CreateConnectionDto } from '../application/dtos/connection.dto';
import { Connection } from '../domain/connection';
import { ParamStoreProcedure } from '../../Shared/infraestructure/mysql/store-procedure.params';

export class ConnectionDataMapper {
  static createConnectionDtotoConnection(connectionDto: CreateConnectionDto) {
    return plainToInstance(Connection, connectionDto);
  }

  static toProcedureParam(connection: Connection): ParamStoreProcedure[] {
    const params: ParamStoreProcedure[] = [
      {
        field: 'Name',
        type: sql.NVarChar(50),
        value: connection.connectionName,
      },
      {
        field: 'List',
        type: sql.NVarChar(100),
        value: connection.connectionList,
      },
    ];

    return params;
  }

  static toIdParam(id: string): ParamStoreProcedure[] {
    return [
      {
        field: 'Id',
        type: sql.NVarChar(20),
        value: id,
      },
    ];
  }
}
