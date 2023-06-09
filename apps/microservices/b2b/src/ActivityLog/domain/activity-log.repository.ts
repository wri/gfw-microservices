import ResultPromise from '../../Shared/domain/result/result.promise';
import { ActivityLog } from './activity-log';

export abstract class ActivityLogRepository {
  abstract saveActivityLog(
    invitation: ActivityLog,
    db: string,
  ): ResultPromise<boolean>;
}
