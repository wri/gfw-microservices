// src/user/user.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { ListAnalysisController } from './list-analysis.controller';
import { ListAnalysisService } from './list-analysis.service';
import { ListUploadController } from './list-upload.controller';
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

AWS.config.update(awsConfig);

@Module({
  imports: [ConfigModule],
  controllers: [ListAnalysisController, ListUploadController],
  providers: [ListAnalysisService],
})
export class ListsAnalysisModule {}
