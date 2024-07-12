import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ListModule } from '../handler/list.module';

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
