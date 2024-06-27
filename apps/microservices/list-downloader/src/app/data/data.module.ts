import { Module } from '@nestjs/common';
import { AlertsDataService } from './alerts.data.service';
import { AnalysisAfiDataService } from './analysis.afi.data.service';
import { AnalysisDataService } from './analysis.data.service';

@Module({
  imports: [],
  providers: [AlertsDataService, AnalysisAfiDataService, AnalysisDataService],
  exports: [AlertsDataService, AnalysisAfiDataService, AnalysisDataService],
})
export class DataModule {}
