import { Logger, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';

import { PipeService } from '../pipe/pipe.service';

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

AWS.config.update(awsConfig);

@Injectable()
export class ListMessageHandler {
  private readonly logger = new Logger(ListMessageHandler.name);

  constructor(private pipeService: PipeService) {}

  @SqsMessageHandler('list-generate-file', true)
  async handleMessage(messages: Array<AWS.SQS.Message>) {
    const [message] = messages;
    const filters = this.reorganizeFilers(message);

    const { listID } = filters;
    // TODO: improve remove message should be automatically
    this.logger.log(`Removing message for the list ${listID}...`);
    await this.removeMessage(message);
    await this.pipeService.makeFile(filters);
  }

  async removeMessage(message: AWS.SQS.Message) {
    const sqs = new AWS.SQS();

    const deleteParams = {
      QueueUrl: process.env.AWS_TMP_QUEUE,
      ReceiptHandle: message.ReceiptHandle,
    };

    const removedMessage = await sqs.deleteMessage(deleteParams).promise();
    this.logger.log(`Removed message: ${JSON.stringify(removedMessage)}`);
  }

  reorganizeFilers(messages: AWS.SQS.Message) {
    const message = messages;

    const getValues = (obj) => obj?.StringValue;

    const getValuesAndSpread = (obj) => {
      const value = obj?.StringValue;
      return value ? JSON.parse(value) : {};
    };

    const {
      analysisArea,
      file,
      geoInfo,
      list,
      organizationDatabase,
      userEmail,
    } = JSON.parse(message.Body);

    return {
      organizationDatabase: getValues(organizationDatabase),
      userEmail: getValues(userEmail),
      ...getValuesAndSpread(analysisArea),
      ...getValuesAndSpread(file),
      ...getValuesAndSpread(geoInfo),
      ...getValuesAndSpread(list),
    };
  }
}
