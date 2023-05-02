import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
import { LogsRepository } from '../domain/log.repository';
import { LogDataMapper } from '../application/log.mapper';
import { Log } from '../domain/log';

export class LogRepositoryMysql
  extends RepositoryMysql
  implements LogsRepository
{
  private mapper: LogDataMapper;

  constructor() {
    super();
    this.mapper = new LogDataMapper();
  }

  async saveActivityLog(log: Log, db: string = null): ResultPromise<boolean> {
    const params = this.mapper.toProcedureParam(log);
    console.log(log)
    const saveLogActivity = this.storeProcedureFactory.create(
      'uspSetActivityLog',
      params,
    );
    const logSaved = await saveLogActivity.execute(db);
    console.log(logSaved);
    return Result.ok(true);
  }
}
