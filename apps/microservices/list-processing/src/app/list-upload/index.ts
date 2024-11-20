import { Module } from '@nestjs/common';
import { ValidateCSVController } from './validation/validate.csv.controller';
import { ValidateCSVService } from './validation/validate.csv.service';
import { S3Service } from '@wri-monorepos/aws';
import { ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidateCsvRepository } from './validation/validate.csv.repository';
import { DeprecatedStartAnalysisService } from './deprecated.start.analysis.service';
import { PreviewListUploadController } from './preview.list.upload.controller';
import { PreviewListUploadService } from './preview.list.upload.service';
import { BullModule } from '@nestjs/bull';
import { StartAnalysisService } from './start.analysis.service';
import { AnalysisProcessor } from './analysis.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListTemplate], 'default'),
    SqlModule,
    BullModule.registerQueue({
      name: 'analysis',
    }),
  ],
  controllers: [ValidateCSVController, PreviewListUploadController],
  providers: [
    AnalysisProcessor,
    DeprecatedStartAnalysisService,
    PreviewListUploadService,
    S3Service,
    StartAnalysisService,
    ValidateCsvRepository,
    ValidateCSVService,
  ],
  exports: [DeprecatedStartAnalysisService, StartAnalysisService],
})
export class ListUploadModule {}
