import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ListAnalysisController } from './list-analysis.controller';
import { ListAnalysisService } from './list-analysis.service';
import { ListUploadController } from './list-upload.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../api-keys/organization.entity';
import { ListService } from '../lists/lists.service';
import { OrganizationService } from './organization.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../validators/server-config';
import { SaveActivityLogEndpoint } from './utils/saveActivityLogEndpoint';
import {
  ActivityLog,
  ClientStoreConnection,
  ExternalAPIKey,
  Lists,
  UserRoutes,
} from '@wri-monorepos/sql';
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ExternalAPIKey, UserRoutes, Organization, Lists, ActivityLog],
      'default'
    ),
  ],
  controllers: [ListAnalysisController, ListUploadController],
  providers: [
    ListAnalysisService,
    UserService,
    ClientStoreConnection,
    OrganizationService,
    ListService,
    S3Service,
    SaveActivityLogEndpoint,
    {
      provide: 'AWS',
      inject: [ConfigService],
      useFactory: (config: ConfigService<ServerConfigType, true>) => {
        new S3Client({
          credentials: {
            accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
          },
          region: config.get('AWS_REGION'),
        });
      },
    },
  ],
  exports: [OrganizationService],
})
export class ListsAnalysisModule {}
