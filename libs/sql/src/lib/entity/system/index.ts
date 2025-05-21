import { Organization } from './organization.entity';
import { GFWList } from './gfw.list.entity';
import { FeatureFlag } from './feature.flag.entity';
import { ListTemplate } from './list.template.entity';
import { ListGFWLists } from './gfwLists.entity';
import { ListAdministrativeAreas } from './list.AdministrativeAreas.entity';
import { ListOilPalmConcessions } from './list.OilPalmConcessions.entity';
import { ListsPalmOilMills } from './list.PalmOilMill.entity';
import { ListProtectedAreas } from './list.protectedAreas.entity';
import { RspoOilPalmConcessions } from './list.rspoOilPalmConcessions.entity';
import { AnalysisAdministrativesAreas } from './analysisAdministrativesAreas';
import { AnalysisOilPalmConcessions } from './analysisOilPalmConcessions';
import { AnalysisPalmOilMills } from './analysisPalmOilMills.entity';
import { AnalysisProtectedAreas } from './analysisProtectedAreas';
import { AnalysisRspoOilPalmConcessions } from './analysisRspoPalmConcessions';
import { UserRoutes } from './user-route.entity';
import { ExternalAPIKey } from './external-api-key.entity';

export * from './organization.entity';
export * from './gfw.list.entity';
export * from './feature.flag.entity';
export * from './list.template.entity';
export * from './gfwLists.entity';
export * from './list.AdministrativeAreas.entity';
export * from './list.OilPalmConcessions.entity';
export * from './list.PalmOilMill.entity';
export * from './list.protectedAreas.entity';
export * from './list.rspoOilPalmConcessions.entity';
export * from './analysisAdministrativesAreas';
export * from './analysisOilPalmConcessions';
export * from './analysisPalmOilMills.entity';
export * from './analysisProtectedAreas';
export * from './analysisRspoPalmConcessions';
export * from './user-route.entity';
export * from './external-api-key.entity';

export const systemEntities = [
  Organization,
  GFWList,
  FeatureFlag,
  ListTemplate,
  ListGFWLists,
  ListAdministrativeAreas,
  ListOilPalmConcessions,
  ListsPalmOilMills,
  ListProtectedAreas,
  RspoOilPalmConcessions,
  AnalysisAdministrativesAreas,
  AnalysisOilPalmConcessions,
  AnalysisPalmOilMills,
  AnalysisProtectedAreas,
  AnalysisRspoOilPalmConcessions,
  UserRoutes,
  ExternalAPIKey,
];
