import { Inject } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { GenerationFileRequest } from '@wri-monorepos/sql';

export abstract class IPipeService {

  constructor(
    @Inject(EmailService) public emailService: EmailService,
    @Inject(S3Service) public s3Service: S3Service) {}

  abstract start(filters: GenerationFileRequest);
  abstract process(data: any);
  abstract finish(filters: GenerationFileRequest);

  public async startEmail(filters: GenerationFileRequest){
    const { listName, userEmail } = filters;
    await this.emailService.sendEmail(
      process.env.SES_SENDER_EMAIL,
      [userEmail],
      `[GFW-PRO] File Generation for list ${listName}`,
      'start',
      { ...filters, listName }
    );
  }

  public async finishedEmail(filters: GenerationFileRequest, location: string){
    const { listName, userEmail } = filters;
    await this.emailService.sendEmail(process.env.SES_SENDER_EMAIL, [userEmail], `[GFW-PRO] File Generation for list ${listName}`, 'finish', {
      ...filters,
      listName,
      location,
    });
  }

  public async errorEmail(filters: GenerationFileRequest){
    const { listName, userEmail } = filters;
    await this.emailService.sendEmail(
      process.env.SES_SENDER_EMAIL,
      [userEmail],
      `[GFW-PRO] File Generation for list ${listName}`,
      'error',
      {
        ...filters,
        listName,
      }
    );
  }
}
