import { SQLUtils } from '@wri-monorepos/sql';
import { SqlConfig } from './config';
import { StoredProcedureCommandFactory } from './store-procedure.comand.factory';

export abstract class RepositoryMssqlSP {
  private readonly connection: SQLUtils;
  protected readonly storeProcedureFactory: StoredProcedureCommandFactory;

  constructor() {
    this.connection = new SQLUtils(SqlConfig);
    this.storeProcedureFactory = new StoredProcedureCommandFactory(
      this.connection,
    );
  }
}
