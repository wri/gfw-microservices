import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { PipeService } from './pipe.service';
import { InputService } from '../files/input.service';
import { AwsModule } from '@wri-monorepos/aws';
import { GFWList, SqlModule } from '@wri-monorepos/sql';
import { ShapefileService } from '../files/shapefile.service';
import { ResultService } from '../files/result.service';
import { DashboardService } from './dashboard.service';
import { ForestLossService } from '../files/forest.loss.service';
import { HistoricPercentService } from '../files/historic.percent.service';
import { ForestChangeDiagnosticLocationSummaryService } from '../files/forest.change.diagnostic.location.summary.service';
import { ForestChangeDiagnosticListSummaryService } from '../files/forest.change.diagnostic.list.summary.service';
import { CommodityRiskDiagnosticLocationSummaryService } from '../files/commodity.risk.diagnostic.location.summary.service';
import { DeforestationTrendsService } from '../files/deforestation.trends.service';
import { MillPriorityService } from '../files/mill.priority.service';
import { PalmRiskAnalysisService } from '../files/palm.risk.analysis.service';
import { SouthAmericaBiomesService } from '../files/south.america.biomes.service';
import { SouthAmericaLossService } from '../files/south.america.loss.service';
import { SouthEastAsiaOverlapService } from '../files/south.east.asia.overlap.service';
import { SouthEastAsiaTCLService } from '../files/south.east.asia.tcl.service';
import { ListGeneratorService } from './list.generator.service';
import { AfiGeneratorService } from './afi.generator.service';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { AfiFileService } from '../files/afi.file.service';
import { ArgentinaOverlapService } from '../files/argentina.overlap.service';
import { AnalysisDataService } from '../data/analysis.data.service';
import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { AlertsDataService } from '../data/alerts.data.service';
import { AlertsAdminAreasLevelService } from '../files/alerts.admin.areas.level.service';
import { AlertsHistoryService } from '../files/alerts.history.service';
import { AlertsLocationsLevelService } from '../files/alerts.locations.level.service';
import { AlertsPrioritiesAdminAreasLevelService } from '../files/alerts.priorities.admin.areas.level.service';
import { AlertsSummaryService } from '../files/alerts.summary.service';
import { AlertsPrioritiesLocationsLevelService } from '../files/alerts.priorities.locations.level.service';
import { AlertsGeneratorService } from './alerts.generator.service';
import { AlertsFileService } from '../files/alerts.file.service';
import { AlertsLocationsHistoryService } from '../files/alerts.locations.history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArgentinaLossOfForestsService } from '../files';

@Module({
  imports: [envModule, AwsModule, SqlModule, TypeOrmModule.forFeature([GFWList], 'default')],
  providers: [
    CommodityRiskDiagnosticLocationSummaryService,
    DashboardService,
    DeforestationTrendsService,
    ForestChangeDiagnosticListSummaryService,
    ForestChangeDiagnosticLocationSummaryService,
    ForestLossService,
    HistoricPercentService,
    InputService,
    MillPriorityService,
    PalmRiskAnalysisService,
    PipeService,
    ResultService,
    ShapefileService,
    SouthAmericaBiomesService,
    SouthAmericaLossService,
    SouthEastAsiaOverlapService,
    SouthEastAsiaTCLService,
    ListGeneratorService,
    AfiGeneratorService,
    AfiFileService,
    ArgentinaOverlapService,
    AnalysisDataService,
    AnalysisAfiDataService,
    AccountUsersAnalysisUsageFileService,
    AlertsDataService,
    AlertsAdminAreasLevelService,
    AlertsHistoryService,
    AlertsLocationsLevelService,
    AlertsPrioritiesAdminAreasLevelService,
    AlertsPrioritiesLocationsLevelService,
    AlertsSummaryService,
    AlertsGeneratorService,
    AlertsFileService,
    AlertsLocationsHistoryService,
    ArgentinaLossOfForestsService,
  ],
  exports: [PipeService],
})
export class PipeModule {}
