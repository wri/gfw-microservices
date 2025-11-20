import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { PipeService } from './pipe.service';
import { AwsModule } from '@wri-monorepos/aws';
import { SqlModule } from '@wri-monorepos/sql';
import { ListGeneratorService } from './list.generator.service';
import { AfiGeneratorService } from './afi.generator.service';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { AlertsGeneratorService } from './alerts.generator.service';
import { FilesModule } from '../files';
import { DataModule } from '../data';
import { DashboardService } from './dashboard.service';
import { AfiVcGeneratorService } from './afi.vc.generator.service';
import { GreenHouseGasEmissionsGeneratorService } from './ghg.generator.service';
import { DownloadActivityLogService } from '../services/download-activity-log.service';

@Module({
  imports: [envModule, AwsModule, SqlModule, FilesModule, DataModule],
  providers: [
    AccountUsersAnalysisUsageFileService,
    AfiGeneratorService,
    AlertsGeneratorService,
    DashboardService,
    ListGeneratorService,
    PipeService,
    AfiVcGeneratorService,
    GreenHouseGasEmissionsGeneratorService,
    DownloadActivityLogService,
  ],
  exports: [PipeService],
})
export class PipeModule {}
