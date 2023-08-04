import { DataSource } from 'typeorm';
import { ConnectionDataMapper } from '../application/connection.mapper';
import { ConnectionRepositoryMssqlSP } from '../infraestructure/connection.repository.mssql.sp';

export class ConnectionRepositorySqlite extends ConnectionRepositoryMssqlSP {
  constructor(dataSource: DataSource) {
    const mapper = new ConnectionDataMapper();
    super(mapper, dataSource);
  }
}
