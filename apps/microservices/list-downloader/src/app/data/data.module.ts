import { Module } from '@nestjs/common';
import { AlertsDataService } from './alerts.data.service';
import { AnalysisAfiDataService } from './analysis.afi.data.service';
import { AnalysisDataService } from './analysis.data.service';
import { AnalysisGhgDataService } from './analysis.ghg.data.service';

@Module({
  imports: [],
  providers: [
    AlertsDataService,
    AnalysisAfiDataService,
    AnalysisDataService,
    AnalysisGhgDataService,
  ],
  exports: [AlertsDataService, AnalysisAfiDataService, AnalysisDataService, AnalysisGhgDataService],
})
export class DataModule {}
