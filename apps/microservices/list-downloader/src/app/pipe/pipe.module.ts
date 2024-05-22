import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { PipeService } from './pipe.service';
import { AwsModule } from '@wri-monorepos/aws';
import { GFWList, SqlModule } from '@wri-monorepos/sql';
import { DashboardService } from './dashboard.service';
import { ListGeneratorService } from './list.generator.service';
import { AfiGeneratorService } from './afi.generator.service';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';

import {
  AfiFileService,
  AlertsFileService,
  AlertsAdminAreasLevelService,
  AlertsHistoryService,
  AlertsLocationsHistoryService,
  AlertsLocationsLevelService,
  AlertsPrioritiesAdminAreasLevelService,
  AlertsPrioritiesLocationsLevelService,
  AlertsSummaryService,
  ArgentinaLossOfForestsAggregateService,
  ArgentinaLossOfForestsService,
  ArgentinaOverlapService,
  CommodityRiskDiagnosticLocationSummaryService,
  DeforestationTrendsService,
  ForestLossService,
  ForestChangeDiagnosticListSummaryService,
  ForestChangeDiagnosticLocationSummaryService,
  HistoricPercentService,
  InputService,
  MillPriorityService,
  PalmRiskAnalysisService,
  ResultService,
  ShapefileService,
  SouthAmericaBiomesService,
  SouthAmericaLossService,
  SouthEastAsiaOverlapService,
  SouthEastAsiaTCLService,
} from '../files';

import { AnalysisDataService } from '../data/analysis.data.service';
import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { AlertsDataService } from '../data/alerts.data.service';

import { AlertsGeneratorService } from './alerts.generator.service';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    ArgentinaLossOfForestsAggregateService,
  ],
  exports: [PipeService],
})
export class PipeModule {}
