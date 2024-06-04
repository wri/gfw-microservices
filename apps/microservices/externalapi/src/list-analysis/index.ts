import { Module } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ListAnalysisController } from './list-analysis.controller';
import { ListAnalysisService } from './list-analysis.service';
import { ListUploadController } from './list-upload.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../api-keys/organization.entity';
import { ExternalAPIKey } from '../api-keys/external-api-key.entity';
import { UserRoutes } from '../api-keys/user-route.entity';
import { ClientStoreConnection } from '../shared/client-store-connection';
import { ListService } from '../lists/lists.service';
import { Lists } from '../lists/lists.entity';
import { OrganizationService } from './organization.service';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { Env } from '../env';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalAPIKey, UserRoutes, Organization, Lists], 'default')],
  controllers: [ListAnalysisController, ListUploadController],
  providers: [
    ListAnalysisService,
    UserService,
    ClientStoreConnection,
    OrganizationService,
    ListService,
    S3Service,
    {
      provide: 'AWS',
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        AWS.config.update({
          accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
          region: config.get('AWS_REGION'),
        });
      },
    },
  ],
  exports: [OrganizationService],
})
export class ListsAnalysisModule {}
