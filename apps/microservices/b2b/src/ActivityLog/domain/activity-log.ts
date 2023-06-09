import { User } from '../../User/domain/user';
import { ActivityType } from '../application/dtos/activity-log.dto';

export class ActivityLog {
  user: User;
  type: ActivityType;
  description: number;
  time: number;
}
