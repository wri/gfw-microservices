import { Inject, Logger } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import {
  BasicFieldsFileRequest,
  setS3UrlAndExpirationDate,
  toSqlParameter,
} from '@wri-monorepos/sql';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
import * as moment from 'moment';

import { SQLUtils } from '@wri-monorepos/sql';

export abstract class IPipeService {
  private readonly loggerPipe = new Logger(IPipeService.name);

  private EXPIRE_IN_FIVE_DAYS = 5;

  @Inject(ConfigService)
  private readonly config: ConfigService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(S3Service)
  private readonly s3Service: S3Service;

  abstract start(filters: BasicFieldsFileRequest, table?: string, fileSuffix?: string);
  abstract process(data, filters: BasicFieldsFileRequest);
  abstract finish(filters: BasicFieldsFileRequest);

  public async startEmail(filters: BasicFieldsFileRequest) {
    const { listName, userEmail } = filters;
    if (userEmail) {
      await this.emailService.sendEmail<{ listName: string }>(
        process.env.SES_SENDER_EMAIL,
        [userEmail],
        `[GFW-PRO] File Generation for list ${listName}`,
        'start',
        { listName }
      );
    }
  }

  public async finishedEmail(filters: BasicFieldsFileRequest, location: string) {
    const { listName, userEmail } = filters;
    if (userEmail) {
      await this.emailService.sendEmail<{
        listName: string;
        location: string;
      }>(
        process.env.SES_SENDER_EMAIL,
        [userEmail],
        `[GFW-PRO] File Generation for list ${listName}`,
        'finish',
        {
          listName,
          location,
        }
      );
    }
  }

  public async errorEmail(filters: BasicFieldsFileRequest) {
    const { listName, userEmail } = filters;
    if (userEmail) {
      await this.emailService.sendEmail<{
        listName: string;
      }>(
        process.env.SES_SENDER_EMAIL,
        [userEmail],
        `[GFW-PRO] File Generation for list ${listName}`,
        'error',
        {
          listName,
        }
      );
    }
  }

  public async uploadFileToS3(filters: BasicFieldsFileRequest) {
    const { key } = filters;
    await this.s3Service.sendFiletoS3(key, 'zip', 'application/zip', process.env.AWS_TMP_BUCKET);
    return await this.s3Service.getFileSignedUrl(key, 'zip', process.env.AWS_TMP_BUCKET);
  }

  async saveS3UrlAtDatabase(filters: BasicFieldsFileRequest, location: string) {
    const { listId, organizationDatabase, type, file } = filters;

    const parameters = toSqlParameter({
      location,
      expirationDate: moment(new Date()).add(this.EXPIRE_IN_FIVE_DAYS, 'days').toDate(),
      listId,
      analysisId: type === 'afi' ? 'AFI' : type === 'alerts' ? 'ALERTS' : 'FCD',
    });

    if (!['input_csv', 'input_shapefile', 'results_csv'].includes(`${type}_${file}`)) {
      try {
        this.loggerPipe.log(
          'Saving S3 URL at database for list ' + listId + ' and analysis ' + type
        );
        await SQLUtils.queryDB(organizationDatabase, setS3UrlAndExpirationDate, parameters);
      } catch (e) {
        this.loggerPipe.log('Error saving S3 URL at database');
      }
    }
  }

  public async writeAllData(inputStream: PassThrough) {
    inputStream.end();
    await finished(inputStream);
    inputStream.removeAllListeners();
    inputStream.destroy();
  }

  public async finishProcess(filters: BasicFieldsFileRequest) {
    const location = await this.uploadFileToS3(filters);
    await this.finishedEmail(filters, location);
    await this.saveS3UrlAtDatabase(filters, location);
  }
}
