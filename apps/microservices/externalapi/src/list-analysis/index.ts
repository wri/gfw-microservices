import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
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
import { ServerConfigType } from '../validators/server-config';
import { SaveActivityLogEndpoint } from './utils/saveActivityLogEndpoint';
import { ActivityLog, GfwLists } from '@wri-monorepos/sql';
import { ClaugerService } from '../clauger/clauger.service';
import { ClaugerController } from '../clauger/clauger.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ExternalAPIKey, UserRoutes, Organization, Lists, ActivityLog],
      'default'
    ),
  ],
  controllers: [ListAnalysisController, ListUploadController, ClaugerController],
  providers: [
    ListAnalysisService,
    UserService,
    ClientStoreConnection,
    OrganizationService,
    ListService,
    S3Service,
    SaveActivityLogEndpoint,
    ClaugerService,
    GfwLists,
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
