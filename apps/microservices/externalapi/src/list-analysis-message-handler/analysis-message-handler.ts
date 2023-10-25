import { ConfigService } from '@nestjs/config';
import { Logger, Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsService } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { AWS_ANALYSIS_QUEUE_IDENTIFIER, AWS_DOWNLOADER_QUEUE_IDENTIFIER } from '../config';
import { OrganizationService } from '../list-analysis/organization.service';
const SUCCESS_STATUS = 2;
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

AWS.config.update(awsConfig);

@Injectable()
export class AnalysisMessageHandler {
  private readonly logger = new Logger(AnalysisMessageHandler.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sqsService: SqsService,
    private organizationService: OrganizationService
  ) {}

  @SqsMessageHandler(AWS_ANALYSIS_QUEUE_IDENTIFIER, true)
  async handleMessage(messages: Array<AWS.SQS.Message>) {
    const [message] = messages;
    try {
      // Body example from: https://gfw.atlassian.net/browse/GPV-1570
      const { Status, /*AnalysisType, AFI,*/ OrgID, ListID } = JSON.parse(message.Body ?? '{}');
      Logger.log(`Message received: ${message.Body}`);

      if (parseInt(Status, 10) === SUCCESS_STATUS) {
        const organization = await this.organizationService.findOrganizationById(OrgID);

        const sqsMessage = {
          organizationDatabase: { DataType: 'String', StringValue: organization.organizationDb },
          file: {
            DataType: 'String',
            StringValue: '{"type":"everything","key":"tmp-udwqe-UVNYzHx455m6","file":"csv"}',
          },
          list: {
            DataType: 'String',
            StringValue: `{"listId":${ListID},"listView":"forest_change"}`,
          },
        };
        await this.sqsService.send(AWS_DOWNLOADER_QUEUE_IDENTIFIER, {
          id: 'dl' + ListID,
          body: sqsMessage,
          messageAttributes: sqsMessage,
          delaySeconds: 0,
          groupId: 'default',
        });
      } else {
        Logger.log(`Status is not COMPLETED, ignoring message`);
      }

      // TODO: improve remove message should be automatically
      this.logger.log(`Removing message for the list ${ListID}...`);
      await this.removeMessage(message);
    } catch (e) {
      Logger.error(`Error processing message: ${e}`);
    }
  }

  async removeMessage(message: AWS.SQS.Message) {
    const sqs = new AWS.SQS();

    const deleteParams = {
      QueueUrl: this.configService.get('AWS_ANALYSIS_QUEUE'),
      ReceiptHandle: message.ReceiptHandle,
    };

    const removedMessage = await sqs.deleteMessage(deleteParams).promise();
    this.logger.log(`Removed message: ${JSON.stringify(removedMessage)}`);
  }
}
