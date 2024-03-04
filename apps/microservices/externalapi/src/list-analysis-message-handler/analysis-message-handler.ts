import { ConfigService } from '@nestjs/config';
import { Logger, Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsService } from '@ssut/nestjs-sqs';
import * as AWS from '@aws-sdk/client-sqs';
import { AWS_ANALYSIS_QUEUE_IDENTIFIER, AWS_DOWNLOADER_QUEUE_IDENTIFIER } from '../config';
import { OrganizationService } from '../list-analysis/organization.service';
import { RemoveSQSMessage, generateRandomFilename } from '@wri-monorepos/shared';

const SUCCESS_STATUS = 2;

@Injectable()
export class AnalysisMessageHandler {
  private readonly logger = new Logger(AnalysisMessageHandler.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sqsService: SqsService,
    private organizationService: OrganizationService
  ) {}

  @SqsMessageHandler(AWS_ANALYSIS_QUEUE_IDENTIFIER, true)
  async handleMessage(messages: Array<AWS.Message>) {
    const [message] = messages;
    try {
      // Body example from: https://gfw.atlassian.net/browse/GPV-1570
      const { Status, AnalysisType, OrgID, ListID } = JSON.parse(message.Body ?? '{}');
      Logger.log(`Message received: ${message.Body}`);

      if (parseInt(Status, 10) === SUCCESS_STATUS) {
        const organization = await this.organizationService.findOrganizationById(OrgID);
        const fileName = generateRandomFilename('');

        let sqsMessage;

        switch (AnalysisType) {
          case 'FCD':
            sqsMessage = {
              organizationDatabase: {
                DataType: 'String',
                StringValue: organization.organizationDb,
              },
              file: {
                DataType: 'String',
                StringValue: `{"type":"everything","key":"${fileName}","file":"csv"}`,
              },
              list: {
                DataType: 'String',
                StringValue: `{"listId":${ListID},"listView":"forest_change"}`,
              },
            };
            break;
          case 'AFI': {
            sqsMessage = {
              organizationDatabase: {
                DataType: 'String',
                StringValue: organization.organizationDb,
              },
              file: {
                DataType: 'String',
                StringValue: `{"type":"afi","key":"${fileName}"}`,
              },
              list: {
                DataType: 'String',
                StringValue: `{"listId":${ListID}}`,
              },
            };
            break;
          }
          case 'ALERTS': {
            sqsMessage = {
              organizationDatabase: {
                DataType: 'String',
                StringValue: organization.organizationDb,
              },
              file: {
                DataType: 'String',
                StringValue: `{"type":"alerts","key":"${fileName}"}`,
              },
              list: {
                DataType: 'String',
                StringValue: `{"listId":${ListID}}`,
              },
              selectedTimeframe: {
                DataType: 'String',
                StringValue: 'MONTH',
              },
              selectedAlert: {
                DataType: 'String',
                StringValue: 'GLAD',
              },
            };
            break;
          }
          default:
            return;
        }

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
      await RemoveSQSMessage(message, this.configService.get<string>('AWS_ANALYSIS_QUEUE'));
    } catch (e) {
      Logger.error(`Error processing message: ${e}`);
    }
  }
}
