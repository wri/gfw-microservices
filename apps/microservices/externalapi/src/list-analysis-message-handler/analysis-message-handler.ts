import { ConfigService } from '@nestjs/config';
import { Logger, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';

import { AWS_ANALYSIS_QUEUE_IDENTIFIER } from '../config';
import { OrganizationService } from '../list-analysis/organization.service';
import { RemoveSQSMessage } from '@wri-monorepos/shared';
import { Message } from '@aws-sdk/client-sqs';
import axios from 'axios';
import { generateAnalysisTemplate } from '../shared/generate-templates';
const SUCCESS_STATUS = 2;

@Injectable()
export class AnalysisMessageHandler {
  private readonly logger = new Logger(AnalysisMessageHandler.name);

  constructor(
    private readonly configService: ConfigService,
    private organizationService: OrganizationService
  ) {
    // Axios trace interceptor is now configured globally in main.ts
  }

  @SqsMessageHandler(AWS_ANALYSIS_QUEUE_IDENTIFIER, true)
  async handleMessage(messages: Array<Message>) {
    const [message] = messages;
    try {
      // Body example from: https://gfw.atlassian.net/browse/GPV-1570
      const { Status, AnalysisType, OrgID, ListID } = JSON.parse(message.Body ?? '{}');
      Logger.log(`Message received: ${message.Body}`);

      if (parseInt(Status, 10) === SUCCESS_STATUS) {
        const organization = await this.organizationService.findOrganizationById(OrgID);

        let message;

        const currentDate = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(currentDate.getDate() - 30);

        if (AnalysisType === 'ALERTS') {
          message = generateAnalysisTemplate({
            startDate: thirtyDaysAgo,
            listId: ListID,
            organization,
            endDate: currentDate,
            analysisId: AnalysisType,
          });
        } else {
          message = generateAnalysisTemplate({
            listId: ListID,
            analysisId: AnalysisType,
            organization,
          });
        }

        await axios.post(
          `${this.configService.get<string>('LD_MICROSERVICE_URL')}/list/download`,
          message
        );
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
