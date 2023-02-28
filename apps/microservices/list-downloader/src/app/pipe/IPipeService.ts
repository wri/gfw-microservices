import { Inject } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { GenerationFileRequest } from '@wri-monorepos/sql';

export abstract class IPipeService {

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(S3Service)
  private readonly s3Service: S3Service;


  abstract start(filters: GenerationFileRequest, table?: string,  fileSuffix?: string);
  abstract process(data: any, filters: GenerationFileRequest);
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

  public async uploadToS3(filters: GenerationFileRequest){
    const { key } = filters;
    this.s3Service.sendFiletoS3(key, 'zip', 'application/zip', process.env.AWS_TMP_BUCKET);
    this.s3Service.getFileSignedUrl(key, 'zip', process.env.AWS_TMP_BUCKET      ).then(location => {
      this.finishedEmail(filters,  location);
    });
  }
}
