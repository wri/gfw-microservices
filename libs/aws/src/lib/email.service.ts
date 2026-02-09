import { Injectable } from '@nestjs/common';
import { SesService } from '@nextnm/nestjs-ses';
import { SesEmailOptions } from '@nextnm/nestjs-ses';
import { createEmailContent } from './emailContent';
import { createPage } from './htmlTemplate';

@Injectable()
export class EmailService {
  constructor(private sesService: SesService) {}

  async sendEmail<CustomFilter>(
    sender: string,
    receivers: Array<string>,
    subject: string,
    type: string,
    filter: CustomFilter | unknown
  ) {
    const content = createPage(createEmailContent<CustomFilter>(type, filter));
    const options: SesEmailOptions = {
      from: sender,
      to: receivers.join(','),
      subject: subject,
      html: content,
      replyTo: '',
    };

    await this.sesService.sendEmail(options);
  }
}
