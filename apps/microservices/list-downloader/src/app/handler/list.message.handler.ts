import { Logger, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs';

import { PipeService } from '../pipe/pipe.service';
import { messageSchema } from './message.schema';

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

const sqsClient = new SQSClient(awsConfig);

@Injectable()
export class ListMessageHandler {
  private readonly logger = new Logger(ListMessageHandler.name);

  constructor(private pipeService: PipeService) {}

  @SqsMessageHandler('list-generate-file', true)
  async handleMessage(messages: Array<{ Body: string; ReceiptHandle: string }>) {
    const [message] = messages;
    const filters = this.reorganizeFilters(message);

    const { listId } = filters;

    if (listId) {
      this.logger.log(`Removing message for the list ${listId}...`);
    }

    // TODO: improve remove message should be automatically
    await this.removeMessage(message);
    await this.pipeService.makeFile(filters);
  }

  async removeMessage(message: { ReceiptHandle: string }) {
    const queueUrl = process.env.AWS_TMP_QUEUE;
    if (!queueUrl) {
      this.logger.error('AWS_TMP_QUEUE environment variable is not set.');
      throw new Error('AWS_TMP_QUEUE environment variable is not set.');
    }

    const deleteParams = {
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle,
    };

    const command = new DeleteMessageCommand(deleteParams);
    const removedMessage = await sqsClient.send(command);
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

    const {
      analysisArea,
      file,
      geoInfo,
      list,
      organizationDatabase,
      userEmail,
      selectedTimeframe,
      selectedAlert,
      startDate,
      endDate,
      type,
      key,
    } = JSON.parse(message.Body ?? '{}');

    const filters = {
      organizationDatabase: getValues(organizationDatabase),
      ...getValues(analysisArea, true),
      ...getValues(file, true),
      ...getValues(geoInfo, true),
      ...getValues(list, true),
    };

    if (getValues(key)) {
      filters.key = getValues(key);
    }
    if (getValues(type)) {
      filters.type = getValues(type);
    }

    const plainMessage = {
      ...filters,
      // avoid logging sensitive data
      userEmail: getValues(userEmail),
      selectedTimeframe: getValues(selectedTimeframe),
      selectedAlert: getValues(selectedAlert),
      startDate: getValues(startDate),
      endDate: getValues(endDate),
    };

    return messageSchema.parse(plainMessage);
  }
}
