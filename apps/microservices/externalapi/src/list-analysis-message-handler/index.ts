import { Logger, Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnalysisMessageHandler } from './analysis-message-handler';
import { AWS_ANALYSIS_QUEUE_IDENTIFIER, AWS_DOWNLOADER_QUEUE_IDENTIFIER } from '../config';
import { ListsAnalysisModule } from '../list-analysis';

AWS.config.update({
  region: process.env.AWS_REGION, // aws region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // aws access key id
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // aws secret access key
});

@Module({
  imports: [
    ConfigModule,
    ListsAnalysisModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const env = config.get<string>('NODE_ENV');
        Logger.log(`Configuring queue for NODE_ENV: ${env}`);
        return {
          consumers: [
            {
              name: AWS_ANALYSIS_QUEUE_IDENTIFIER,
              queueUrl: config.get<string>('AWS_ANALYSIS_QUEUE'),
              region: config.get<string>('AWS_REGION'),
              waitTimeSeconds: 1,
              batchSize: 3,
              terminateVisibilityTimeout: true,
              messageAttributeNames: ['All'],
            },
          ],
          producers: [
            {
              name: AWS_DOWNLOADER_QUEUE_IDENTIFIER,
              queueUrl: config.get<string>('AWS_DOWNLOAD_QUEUE'),
              region: config.get<string>('AWS_REGION'),
            },
          ],
        };
      },
    }),
  ],
  providers: [AnalysisMessageHandler],
  exports: [AnalysisMessageHandler],
})
export class ListAnalysisMessageModule {}
