import { RepositoryMssqlSP } from '../../Shared/infraestructure/mysql/repository.mysql';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import { LogsRepository } from '../domain/log.repository';
import { LogDataMapper } from '../application/log.mapper';
import { Log } from '../domain/log';

export class LogRepositoryMysql
  extends RepositoryMssqlSP
  implements LogsRepository
{
  private mapper: LogDataMapper;

  constructor() {
    super();
    this.mapper = new LogDataMapper();
  }

  async saveActivityLog(log: Log, db: string = null): ResultPromise<boolean> {
    const params = this.mapper.toProcedureParam(log);
    const saveLogActivity = this.storeProcedureFactory.create(
      'uspSetActivityLog',
      params,
    );
    await saveLogActivity.execute(db);
    return Result.ok(true);
  }
}
