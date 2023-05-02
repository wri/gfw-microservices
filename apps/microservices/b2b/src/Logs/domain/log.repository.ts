import ResultPromise from '../../Shared/domain/result/result.promise';
import { Log } from '../domain/log';

export abstract class LogsRepository {
  abstract saveActivityLog(invitation: Log, db: string): ResultPromise<boolean>;
}
