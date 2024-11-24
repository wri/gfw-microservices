import { Inject, Logger } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
import * as moment from 'moment';

import {
  BasicFieldsFileRequest,
  setS3UrlAndExpirationDate,
  toSqlParameter,
  setS3UrlAndExpirationDateVC,
} from '@wri-monorepos/sql';
import { SQLUtils } from '@wri-monorepos/sql';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';

export abstract class IPipeService {
  private readonly loggerPipe = new Logger(IPipeService.name);

  private EXPIRE_IN_FIVE_DAYS = 5;
  private EXPIRE_IN_TWENTY_FOUR_HOURS = 24;
  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(S3Service)
  private readonly s3Service: S3Service;

  @Inject(ConfigService)
  readonly configService: ConfigService<ServerConfigType, true>;

  abstract start(filters: BasicFieldsFileRequest, table?: string, fileSuffix?: string);
  abstract process(data, filters: BasicFieldsFileRequest);
  abstract finish(filters: BasicFieldsFileRequest);

  public async startEmail(filters: BasicFieldsFileRequest) {
    const { listName, userEmail, type } = filters;
    if (userEmail && type !== 'afiVC') {
      await this.emailService.sendEmail<{ listName: string }>(
        this.configService.get('SES_SENDER_EMAIL', { infer: true }),
        [userEmail],
        `[GFW-PRO] File Generation for list ${listName}`,
        'start',
        { listName }
      );
    }
  }

  public async finishedEmail(filters: BasicFieldsFileRequest, location: string) {
    const { listName, userEmail, type } = filters;
    if (userEmail && type !== 'afiVC') {
      await this.emailService.sendEmail<{
        listName: string;
        location: string;
      }>(
        this.configService.get('SES_SENDER_EMAIL', { infer: true }),
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
    const { listName, userEmail, type } = filters;
    if (userEmail && type !== 'afiVC') {
      await this.emailService.sendEmail<{
        listName: string;
      }>(
        this.configService.get('SES_SENDER_EMAIL', { infer: true }),
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
    await this.s3Service.sendFiletoS3(
      key,
      'zip',
      'application/zip',
      this.configService.get('AWS_TMP_BUCKET', { infer: true })
    );
    return await this.s3Service.getFileSignedUrl(
      key,
      'zip',
      this.configService.get('AWS_TMP_BUCKET', { infer: true })
    );
  }

  async saveS3UrlAtDatabase(filters: BasicFieldsFileRequest, location: string) {
    const { listId, organizationDatabase, type, file, isGFWList } = filters;
    let formattedAnalysisId = 'AFI';
    switch (type) {
      case 'afiVC':
      case 'afi':
        formattedAnalysisId = 'AFI';
        break;
      case 'alerts':
        formattedAnalysisId = 'ALERTS';
        break;
      case 'fcd':
        formattedAnalysisId = 'FCD';
        break;
    }
    const parameters = toSqlParameter({
      location,
      expirationDate:
        type === 'afiVC'
          ? moment(new Date()).add(this.EXPIRE_IN_TWENTY_FOUR_HOURS, 'hours').toDate()
          : moment(new Date()).add(this.EXPIRE_IN_FIVE_DAYS, 'days').toDate(),
      bundleCreationTime: new Date(),
      listId,
      analysisId: formattedAnalysisId,
    });

    if (
      !['input_csv', 'input_shapefile', 'results_csv'].includes(`${type}_${file}`) &&
      !isGFWList
    ) {
      try {
        this.loggerPipe.log(
          'Saving S3 URL at database for list ' + listId + ' and analysis ' + type
        );
        type === 'afiVC'
          ? await SQLUtils.queryDB(organizationDatabase, setS3UrlAndExpirationDateVC, parameters)
          : await SQLUtils.queryDB(organizationDatabase, setS3UrlAndExpirationDate, parameters);
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
