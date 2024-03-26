import { Organization } from './organization.entity';
import { GFWList } from './gfw.list.entity';
import { FeatureFlag } from './feature.flag.entity';

export * from './organization.entity';
export * from './gfw.list.entity';
export * from './feature.flag.entity';

export const systemEntities = [Organization, GFWList, FeatureFlag];
