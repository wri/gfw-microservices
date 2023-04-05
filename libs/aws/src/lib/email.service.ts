import { Injectable } from '@nestjs/common';
import { SesService } from '@nextnm/nestjs-ses';
import { SesEmailOptions } from '@nextnm/nestjs-ses';
import { createEmailContent } from './emailContent';
import { createPage } from './htmlTemplate';

@Injectable()
export class EmailService {
  constructor(private sesService: SesService) {}

  async sendEmail(
    sender: string,
    receivers: Array<string>,
    subject: string,
    type: string,
    filter: { listName: string; location: string }
  ) {
    const content = createPage(createEmailContent(type, filter, { sender }));
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
