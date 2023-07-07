import { RepositoryMssqlSP } from '../../Shared/infraestructure/mysql/repository.mysql';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import { ActivityLogDataMapper } from '../application/activity-log.mapper';
import { ActivityLogRepository } from '../domain/activity-log.repository';
import { ActivityLog } from '../domain/activity-log';
import { getQueryStr } from '@wri-monorepos/sql';

export class ActivityLogRepositoryMysql
  extends RepositoryMssqlSP
  implements ActivityLogRepository
{
  private mapper: ActivityLogDataMapper;

  constructor() {
    super();
    this.mapper = new ActivityLogDataMapper();
  }

  async saveActivityLog(
    log: ActivityLog,
    db: string = null,
  ): ResultPromise<boolean> {
    const params = this.mapper.toProcedureParam(log);
    const saveLogActivity = this.storeProcedureFactory.create(
      getQueryStr(false, 'uspSetActivityLog'),
      params,
    );
    await saveLogActivity.execute(db);
    return Result.ok(true);
  }
}
