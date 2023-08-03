import { DataSource } from 'typeorm';
import { ConnectionDataMapper } from '../application/connection.mapper';
import { ConnectionRepositorySP } from '../domain/connection.repository.sp';
import { ConnectionRepositoryMssqlSP } from '../infraestructure/connection.repository.mssql.sp';

export class ConnectionRepositorySqlite extends ConnectionRepositoryMssqlSP {
  constructor(dataSource: DataSource) {
    const mapper = new ConnectionDataMapper();
    super(mapper, dataSource);
  }
}
