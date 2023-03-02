import { SQLUtils } from '../../../../../../../libs/sql/src';
import { SqlConfig } from './config';
import { StoredProcedureCommandFactory } from './store-procedure.comand.factory';

export abstract class RepositoryMysql {
  private readonly connection: SQLUtils;
  protected readonly storeProcedureFactory: StoredProcedureCommandFactory;

  constructor() {
    this.connection = new SQLUtils(SqlConfig);
    this.storeProcedureFactory = new StoredProcedureCommandFactory(
      this.connection,
    );
  }
}
