import { Module } from '@nestjs/common';
import { AwsModule, S3Service } from '@wri-monorepos/aws';
import { DeleteListTypeOrm, ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartAnalysisService } from './start.analysis.service';
import { PreviewListUploadController } from './preview.list.upload.controller';
import { PreviewListUploadService } from './preview.list.upload.service';
import { CreateLargeListService } from './create.large.list.service';
import { CommodityModule } from '../commodity';
import { SaveListToProcessService } from './save.list.to.process.service';
import { DeleteListService } from './delete.list.service';
import { ListUploadController } from './list-upload.controller';
import { QueueService } from './queue.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListTemplate], 'default'),
    SqlModule,
    AwsModule,
    CommodityModule,
  ],
  controllers: [PreviewListUploadController, ListUploadController],
  providers: [
    S3Service,
    StartAnalysisService,
    PreviewListUploadService,
    CreateLargeListService,
    SaveListToProcessService,
    DeleteListService,
    DeleteListTypeOrm,
    QueueService,
  ],
  exports: [StartAnalysisService, CreateLargeListService, QueueService],
})
export class ListUploadModule {}
