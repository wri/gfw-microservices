import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { createEmailContent } from './emailContent';
import { createPage } from './htmlTemplate';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sesClient = new SESClient({ region: process.env.AWS_REGION });

  async sendEmail<CustomFilter>(
    sender: string,
    receivers: Array<string>,
    subject: string,
    type: string,
    filter: CustomFilter | unknown
  ) {
    const html = createPage(createEmailContent<CustomFilter>(type, filter));

    const command = new SendEmailCommand({
      Source: sender,
      Destination: { ToAddresses: receivers },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    });

    try {
      await this.sesClient.send(command);
    } catch (err) {
      this.logger.error(
        `Failed to send SES email (subject="${subject}", recipients=${receivers.length})`,
        err instanceof Error ? err.stack : err
      );
      throw err;
    }
  }
}
