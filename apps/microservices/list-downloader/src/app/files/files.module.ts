import { Module } from '@nestjs/common';
import { AlertsAdminAreasLevelService } from './alerts.admin.areas.level.service';
import { AlertsFileService } from './alerts.file.service';
import { AlertsHistoryService } from './alerts.history.service';
import { AlertsGlobalIntegratedDisturbanceDailyService } from './alerts.global.integrated.disturbance.daily.service';
import { AlertsLocationsLevelService } from './alerts.locations.level.service';
import { AlertsPrioritiesAdminAreasLevelService } from './alerts.priorities.admin.areas.level.service';
import { AlertsPrioritiesLocationsLevelService } from './alerts.priorities.locations.level.service';
import { AlertsSummaryService } from './alerts.summary.service';
import { ArgentinaDeforestationService } from './argentina-deforestation.service';
import { ArgentinaOverlapService } from './argentina.overlap.service';
import { CommodityRiskDiagnosticLocationSummaryService } from './commodity.risk.diagnostic.location.summary.service';
import { DeforestationTrendsService } from './deforestation.trends.service';
import { ForestChangeDiagnosticListSummaryService } from './forest.change.diagnostic.list.summary.service';
import { ForestChangeDiagnosticLocationSummaryService } from './forest.change.diagnostic.location.summary.service';
import { ForestLossService } from './forest.loss.service';
import { HistoricPercentService } from './historic.percent.service';
import { InputService } from './input.service';
import { MillPriorityService } from './mill.priority.service';
import { NaturalForestLossService } from './natural.forest.loss.service';
import { OtherKpisService } from './other.kpis.service';
import { PalmRiskAnalysisService } from './palm.risk.analysis.service';
import { ReadmeService } from './readme.service';
import { GeometryService } from './geometry.service';
import { SouthAmericaBiomesService } from './south.america.biomes.service';
import { SouthAmericaLossService } from './south.america.loss.service';
import { SouthEastAsiaOverlapService } from './south.east.asia.overlap.service';
import { SouthEastAsiaTCLService } from './south.east.asia.tcl.service';
import { AwsModule } from '@wri-monorepos/aws';
import { SqlModule } from '@wri-monorepos/sql';
import { ColombiaOverlapService } from './colombia-overlap.service';
import { ColombiaDeforestationService } from './colombia-deforestation.service';
import { AfiGeometryService } from './afiVC.geometry.service';
import { ReadmeMergeServices } from '../shared/readme.merge.service';
import { GreenHouseGasEmissionsService } from './greenhouse.gas.emissions.service';
import { ListMetadataService } from '../shared/list-metadata.service';
import { ColumnResolverService } from '../shared/column-resolver.service';
import { GhgRawEmissions } from './ghg.raw.emissions.service';
import { GhgIntermediateOutputs } from './ghg.intermediate.outputs.service';
@Module({
  imports: [AwsModule, SqlModule],
  providers: [
    AlertsAdminAreasLevelService,
    AlertsFileService,
    AlertsHistoryService,
    AlertsGlobalIntegratedDisturbanceDailyService,
    AlertsLocationsLevelService,
    AlertsPrioritiesAdminAreasLevelService,
    AlertsPrioritiesLocationsLevelService,
    AlertsSummaryService,
    ArgentinaDeforestationService,
    ArgentinaOverlapService,
    CommodityRiskDiagnosticLocationSummaryService,
    DeforestationTrendsService,
    ForestChangeDiagnosticListSummaryService,
    ForestChangeDiagnosticLocationSummaryService,
    ForestLossService,
    HistoricPercentService,
    InputService,
    MillPriorityService,
    NaturalForestLossService,
    OtherKpisService,
    PalmRiskAnalysisService,
    ReadmeService,
    GeometryService,
    SouthAmericaBiomesService,
    SouthAmericaLossService,
    SouthEastAsiaOverlapService,
    SouthEastAsiaTCLService,
    ColombiaOverlapService,
    ColombiaDeforestationService,
    AfiGeometryService,
    ReadmeMergeServices,
    GreenHouseGasEmissionsService,
    ListMetadataService,
    ColumnResolverService,
    GhgRawEmissions,
    GhgIntermediateOutputs,
  ],
  exports: [
    AlertsAdminAreasLevelService,
    AlertsFileService,
    AlertsHistoryService,
    AlertsGlobalIntegratedDisturbanceDailyService,
    AlertsLocationsLevelService,
    AlertsPrioritiesAdminAreasLevelService,
    AlertsPrioritiesLocationsLevelService,
    AlertsSummaryService,
    ArgentinaDeforestationService,
    ArgentinaOverlapService,
    CommodityRiskDiagnosticLocationSummaryService,
    DeforestationTrendsService,
    ForestChangeDiagnosticListSummaryService,
    ForestChangeDiagnosticLocationSummaryService,
    ForestLossService,
    HistoricPercentService,
    InputService,
    MillPriorityService,
    NaturalForestLossService,
    OtherKpisService,
    PalmRiskAnalysisService,
    ReadmeService,
    GeometryService,
    SouthAmericaBiomesService,
    SouthAmericaLossService,
    SouthEastAsiaOverlapService,
    SouthEastAsiaTCLService,
    ColombiaOverlapService,
    ColombiaDeforestationService,
    AfiGeometryService,
    ReadmeMergeServices,
    GreenHouseGasEmissionsService,
    ListMetadataService,
    ColumnResolverService,
    GhgRawEmissions,
    GhgIntermediateOutputs,
  ],
})
export class FilesModule {}
