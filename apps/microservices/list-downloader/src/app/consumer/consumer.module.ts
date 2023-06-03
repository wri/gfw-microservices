import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ListModule } from '../handler/list.module';
import * as AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.AWS_REGION, // aws region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // aws access key id
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // aws secret access key
});

@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: 'list-generate-file', // name of the queue
          queueUrl: process.env.AWS_TMP_QUEUE, // the url of the queue
          region: process.env.AWS_REGION,
          waitTimeSeconds: 1,
          batchSize: 3,
          terminateVisibilityTimeout: true,
          messageAttributeNames: ['All'],
        },
      ],
      producers: [],
    }),
    ListModule,
  ],
  controllers: [],
  providers: [],
})
export class ConsumerModule {}
