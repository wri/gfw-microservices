import { SQLUtils } from '@wri-monorepos/sql';
import { DataSource } from 'typeorm';
import { SqlConfig } from './config';
import { StoredProcedureCommandFactory } from './store-procedure.comand.factory';

export abstract class RepositoryMssqlSP {
  private readonly connection: SQLUtils | DataSource;
  protected readonly storeProcedureFactory: StoredProcedureCommandFactory;

  constructor(dataSoruce: DataSource = null) {
    if (process.env.NODE_ENV === 'test') {
      this.connection = dataSoruce;
    } else {
      this.connection = new SQLUtils(SqlConfig);
    }

    this.storeProcedureFactory = new StoredProcedureCommandFactory(
      this.connection,
    );
  }
}
