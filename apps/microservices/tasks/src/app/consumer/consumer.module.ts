import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { LLPModule } from '../llp/llp.module';
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
                    name: 'llp-generate-file', // name of the queue 
                    queueUrl: process.env.AWS_TMP_QUEUE, // the url of the queue
                    region: process.env.AWS_REGION,
                },
            ],
            producers: [],
        }),
        LLPModule,
    ],
    controllers: [],
    providers: [],
})
export class ConsumerModule { }