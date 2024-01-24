import { Organization } from './organization.entity';
import { GFWList } from './gfw.list.entity';

export * from './organization.entity';
export * from './gfw.list.entity';

export const systemEntities = [Organization, GFWList];
