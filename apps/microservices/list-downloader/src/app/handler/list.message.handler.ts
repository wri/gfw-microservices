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
    const filters = this.reorganizeFilters(message);

    const { listId } = filters;
    // TODO: improve remove message should be automatically
    this.logger.log(`Removing message for the list ${listId}...`);
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

  reorganizeFilters(messages: AWS.SQS.Message) {
    const message = messages;

    const getValues = (obj, spread = false) => {
      let value = obj?.StringValue;
      if (spread) {
        value = value === 'undefined' ? '{}' : value;
        value = value ? JSON.parse(value ?? '{}') : {};
      } else {
        value = value === 'undefined' ? '' : value;
      }
      return value;
    };

    const { analysisArea, file, geoInfo, list, organizationDatabase, userEmail } = JSON.parse(
      message.Body ?? '{}'
    );

    const filters = {
      organizationDatabase: getValues(organizationDatabase),
      ...getValues(analysisArea, true),
      ...getValues(file, true),
      ...getValues(geoInfo, true),
      ...getValues(list, true),
    };

    // temporally log just to understand type error bug
    this.logger.debug(`Received message ${JSON.stringify(filters)}...`);

    return {
      ...filters,
      // avoid logging sensitive data
      userEmail: getValues(userEmail),
    };
  }
}
