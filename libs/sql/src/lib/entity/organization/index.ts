import { List } from './list.entity';
import { ActivityLog } from './activityLog.entity';
import { ListsUploadStatus } from './lists.upload.status.entity';

export * from './list.entity';
export * from './activityLog.entity';
export * from './lists.upload.status.entity';

export const organizationEntities = [List, ActivityLog, ListsUploadStatus];
