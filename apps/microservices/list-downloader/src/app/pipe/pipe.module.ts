import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { PipeService } from './pipe.service';
import { AwsModule } from '@wri-monorepos/aws';
import { GFWList, SqlModule } from '@wri-monorepos/sql';
import { ListGeneratorService } from './list.generator.service';
import { AfiGeneratorService } from './afi.generator.service';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { AlertsGeneratorService } from './alerts.generator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files';
import { DataModule } from '../data';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    envModule,
    AwsModule,
    SqlModule,
    TypeOrmModule.forFeature([GFWList], 'default'),
    FilesModule,
    DataModule,
  ],
  providers: [
    AccountUsersAnalysisUsageFileService,
    AfiGeneratorService,
    AlertsGeneratorService,
    DashboardService,
    ListGeneratorService,
    PipeService,
  ],
  exports: [PipeService],
})
export class PipeModule {}
