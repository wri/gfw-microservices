import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { OrganizationService } from './organization.service';
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

AWS.config.update(awsConfig);

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ExternalAPIKey, UserRoutes, Organization], 'default'),
  ],
  controllers: [ListAnalysisController, ListUploadController],
  providers: [ListAnalysisService, UserService, ClientStoreConnection, OrganizationService],
})
export class ListsAnalysisModule {}
