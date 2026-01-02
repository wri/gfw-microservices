import { Module } from '@nestjs/common';
import { AwsModule, S3Service } from '@wri-monorepos/aws';
import { ListTemplate, SqlModule } from '@wri-monorepos/sql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartAnalysisService } from './start.analysis.service';
import { PreviewListUploadController } from './preview.list.upload.controller';
import { PreviewListUploadService } from './preview.list.upload.service';
import { CreateLargeListService } from './create.large.list.service';
import { ListModule } from '../list';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { ListUploadController } from './list-upload.controller';
import { SaveListProcessService } from './save.list.process.service';
import { ListUploadService } from './list-upload.service';
import { RedisQueueService } from './redis-queue.service';

@Module({
  imports: [TypeOrmModule.forFeature([ListTemplate], 'default'), SqlModule, AwsModule, ListModule],
  controllers: [PreviewListUploadController, ListUploadController],
  providers: [
    S3Service,
    RedisQueueService,
    StartAnalysisService,
    PreviewListUploadService,
    CreateLargeListService,
    SaveListProcessService,
    ListUploadService,
    {
      provide: 'S3Client',
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ServerConfigType, true>) => {
        return new S3Client({
          region: configService.get('AWS_REGION', { infer: true }),
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID', { infer: true }),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY', { infer: true }),
          },
        });
      },
    },
  ],
  exports: [StartAnalysisService, CreateLargeListService],
})
export class ListUploadModule {}
