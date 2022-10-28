import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';


console.log('config.AWS_REGION', process.env.AWS_REGION);
@Injectable()
export class LLPMessageHandler {

    @SqsMessageHandler('llp-generate-file', true)
    async handleMessage(message: AWS.SQS.Message) {
        console.log(message);
        // use the data and consume it the way you want // 

    }
}