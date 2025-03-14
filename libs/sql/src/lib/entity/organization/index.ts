import { Lists } from './lists.entity';
import { ActivityLog } from './activityLog.entity';
import { ListsUploadStatus } from './lists.upload.status.entity';
import { User } from './user.entity';
import { Analyses } from './analyses.entity';
import { ListsAnalysisStatus } from './lists.analysis.status.entity';
import { AnalysesDashboardEntity } from './analyses.dashboard.entity';
import { ListsPalmOilMills } from './gwfList.PalmOilMill.entity';
import { ListGFWLists } from './gfwLists.entity';
import { AnalysisPalmOilMills } from './analysisPalmOilMills.entity';
import { RspoOilPalmConcessions } from './rspoOilPalmConcessions.entity';
import { ListAdministrativeAreas } from './list.AdministrativeAreas.entity';
import { ListOilPalmConcessions } from './list.OilPalmConcessions.entity';
import { ListProtectedAreas } from './list.protectedAreas.entity';
import { AnalysisAdministrativesAreas } from './analysisAdministrativesAreas';
import { AnalysisRspoOilPalmConcessions } from './analysisRspoPalmConcessions';
import { AnalysisOilPalmConcessions } from './analysisOilPalmConcessions';
import { AnalysisProtectedAreas } from './analysisProtectedAreas';
import { AFIAnalysis } from './afiAnalysis.entity';
import { LargeLists } from './largeLists.entity';
import { GHGAnalyses } from './ghgAnalyses.entity';
import { ExternalUpload } from './externalUpload.entity';

export * from './lists.entity';
export * from './activityLog.entity';
export * from './lists.upload.status.entity';
export * from './user.entity';
export * from './list.schema';
export * from './analyses.entity';
export * from './analysis.schema';
export * from './lists.analysis.status.entity';
export * from './analyses.dashboard.entity';
export * from './gwfList.PalmOilMill.entity';
export * from './gfwLists.entity';
export * from './analysisPalmOilMills.entity';
export * from './rspoOilPalmConcessions.entity';
export * from './list.AdministrativeAreas.entity';
export * from './list.OilPalmConcessions.entity';
export * from './list.protectedAreas.entity';
export * from './analysisAdministrativesAreas';
export * from './analysisRspoPalmConcessions';
export * from './analysisOilPalmConcessions';
export * from './analysisProtectedAreas';
export * from './afiAnalysis.entity';
export * from './listAttributes.entity';
export * from './largeLists.entity';
export * from './ghgAnalyses.entity';
export * from './externalUpload.entity';

export const organizationEntities = [
  Lists,
  ActivityLog,
  ListsUploadStatus,
  User,
  Analyses,
  ListsAnalysisStatus,
  AnalysesDashboardEntity,
  ListGFWLists,
  ListsPalmOilMills,
  AnalysisPalmOilMills,
  RspoOilPalmConcessions,
  ListAdministrativeAreas,
  ListOilPalmConcessions,
  ListProtectedAreas,
  AnalysisAdministrativesAreas,
  AnalysisRspoOilPalmConcessions,
  AnalysisOilPalmConcessions,
  AnalysisProtectedAreas,
  AFIAnalysis,
  LargeLists,
  GHGAnalyses,
  ExternalUpload,
];
