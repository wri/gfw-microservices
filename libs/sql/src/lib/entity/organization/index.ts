import { Lists } from './lists.entity';
import { ActivityLog } from './activityLog.entity';
import { ListsUploadStatus } from './lists.upload.status.entity';
import { User } from './user.entity';
import { Analyses } from './analyses.entity';
import { ListsAnalysisStatus } from './lists.analysis.status.entity';
import { ListsPalmOilMills } from './gwfList.PalmOilMill.entity';
import { ListGFWLists } from './gfwLists.entity';
import { AnalysisPalmOilMills } from './analysisPalmOilMills.entity';
import { RspoOilPalmConcessions } from './rspoOilPalmConcessions.entity';
import { ListAdministrativeAreas } from './list.AdministrativeAreas.entity';
import { ListOilPalmConcessions } from './list.OilPalmConcessions.entity';
import { ListProtectedAreas } from './list.protectedAreas.entity';

export * from './lists.entity';
export * from './activityLog.entity';
export * from './lists.upload.status.entity';
export * from './user.entity';
export * from './list.schema';
export * from './analyses.entity';
export * from './analysis.schema';
export * from './lists.analysis.status.entity';
export * from './gfwLists.entity';
export * from './gwfList.PalmOilMill.entity';
export * from './analysisPalmOilMills.entity';
export * from './rspoOilPalmConcessions.entity';
export * from './list.AdministrativeAreas.entity';
export * from './list.OilPalmConcessions.entity';
export * from './list.protectedAreas.entity';

export const organizationEntities = [
  Lists,
  ActivityLog,
  ListsUploadStatus,
  User,
  Analyses,
  ListsAnalysisStatus,
  ListGFWLists,
  ListsPalmOilMills,
  AnalysisPalmOilMills,
  RspoOilPalmConcessions,
  ListAdministrativeAreas,
  ListOilPalmConcessions,
  ListProtectedAreas,
];
