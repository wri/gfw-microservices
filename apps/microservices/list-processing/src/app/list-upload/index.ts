import { Module } from '@nestjs/common';
import { ValidateCSVController } from './validation/validate.csv.controller';
import { ValidateCSVService } from './validation/validate.csv.service';
import { AwsModule, S3Service } from '@wri-monorepos/aws';
import { ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidateCsvRepository } from './validation/validate.csv.repository';
import { DeprecatedStartAnalysisService } from './deprecated.start.analysis.service';
import { ChainEvents, StartAnalysisService } from './start.analysis.service';
import { PreviewListUploadController } from './preview.list.upload.controller';
import { PreviewListUploadService } from './preview.list.upload.service';
import { DeprecatedCreateLargeListService } from './deprecated.create.large.list.service';
import { CreateLargeListService } from './create.large.list.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default'), SqlModule, AwsModule],
  controllers: [ValidateCSVController, PreviewListUploadController],
  providers: [
    ValidateCSVService,
    S3Service,
    ValidateCsvRepository,
    DeprecatedStartAnalysisService,
    StartAnalysisService,
    ChainEvents,
    PreviewListUploadService,
    DeprecatedCreateLargeListService,
    CreateLargeListService,
  ],
  exports: [
    DeprecatedStartAnalysisService,
    StartAnalysisService,
    DeprecatedCreateLargeListService,
    CreateLargeListService,
  ],
})
export class ListUploadModule {}
