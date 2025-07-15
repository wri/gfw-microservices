import { Module } from '@nestjs/common';
import { AwsModule, S3Service } from '@wri-monorepos/aws';
import { ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeprecatedStartAnalysisService } from './deprecated.start.analysis.service';
import { StartAnalysisService } from './start.analysis.service';
import { PreviewListUploadController } from './preview.list.upload.controller';
import { PreviewListUploadService } from './preview.list.upload.service';
import { DeprecatedCreateLargeListService } from './deprecated.create.large.list.service';
import { CreateLargeListService } from './create.large.list.service';
import { ListModule } from '../list';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default'), SqlModule, AwsModule, ListModule],
  controllers: [PreviewListUploadController],
  providers: [
    S3Service,
    DeprecatedStartAnalysisService,
    StartAnalysisService,
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
