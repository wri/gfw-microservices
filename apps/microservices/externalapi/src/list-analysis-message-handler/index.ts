import { Logger, Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ConfigService } from '@nestjs/config';
import { AnalysisMessageHandler } from './analysis-message-handler';
import { AWS_ANALYSIS_QUEUE_IDENTIFIER, AWS_DOWNLOADER_QUEUE_IDENTIFIER } from '../config';
import { ListsAnalysisModule } from '../list-analysis';
import { ServerConfigType } from '../validators/server-config';
import { S3Client } from '@aws-sdk/client-s3';
@Module({
  imports: [
    ListsAnalysisModule,
    SqsModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<ServerConfigType, true>) => {
        new S3Client({
          credentials: {
            accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
          },
          region: config.get('AWS_REGION'),
        });
        const env = config.get('NODE_ENV', { infer: true });
        Logger.log(`Configuring queue for NODE_ENV: ${env}`);
        return {
          consumers: [
            {
              name: AWS_ANALYSIS_QUEUE_IDENTIFIER,
              queueUrl: config.get('AWS_ANALYSIS_QUEUE'),
              region: config.get('AWS_REGION'),
              waitTimeSeconds: 1,
              batchSize: 3,
              terminateVisibilityTimeout: true,
              messageAttributeNames: ['All'],
            },
          ],
          producers: [
            {
              name: AWS_DOWNLOADER_QUEUE_IDENTIFIER,
              queueUrl: config.get('AWS_DOWNLOAD_QUEUE'),
              region: config.get('AWS_REGION'),
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
