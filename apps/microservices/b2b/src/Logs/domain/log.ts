import { User } from '../../User/domain/user';
import { ActivityType } from '../application/dtos/log.dto';

export class Log {
  user: User;
  type: ActivityType;
  description: number;
  time: number;
}
