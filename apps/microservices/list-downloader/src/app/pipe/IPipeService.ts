import { Inject, Logger } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import {
  GenerationFileRequest,
  setS3UrlAndExpirationDate,
  toSqlParameter,
} from '@wri-monorepos/sql';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
import * as moment from 'moment';

import { SQLUtils } from '@wri-monorepos/sql';

export abstract class IPipeService {
  private readonly loggerPipe = new Logger(IPipeService.name);

  @Inject(ConfigService)
  private readonly config: ConfigService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(S3Service)
  private readonly s3Service: S3Service;

  abstract start(filters: GenerationFileRequest, table?: string, fileSuffix?: string);
  abstract process(data, filters: GenerationFileRequest);
  abstract finish(filters: GenerationFileRequest);

  public async startEmail(filters: GenerationFileRequest) {
    const { listName, userEmail } = filters;
    if (userEmail) {
      await this.emailService.sendEmail(
        process.env.SES_SENDER_EMAIL,
        [userEmail],
        `[GFW-PRO] File Generation for list ${listName}`,
        'start',
        { listName }
      );
    }
  }

  public async finishedEmail(filters: GenerationFileRequest, location: string) {
    const { listName, userEmail } = filters;
    if (userEmail) {
      await this.emailService.sendEmail(
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

  public async errorEmail(filters: GenerationFileRequest) {
    const { listName, userEmail } = filters;
    if (userEmail) {
      await this.emailService.sendEmail(
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

  public async uploadToS3(filters: GenerationFileRequest) {
    const { key } = filters;
    await this.s3Service.sendFiletoS3(key, 'zip', 'application/zip', process.env.AWS_TMP_BUCKET);
    const location = await this.s3Service.getFileSignedUrl(key, 'zip', process.env.AWS_TMP_BUCKET);
    await this.finishedEmail(filters, location);
    await this.saveS3UrlAtDatabase(filters, location);
  }

  async saveS3UrlAtDatabase(filters: GenerationFileRequest, location: string) {
    const { listId, organizationDatabase, type } = filters;

    const connection = new SQLUtils({
      user: this.config.get<string>('MSSQL_USERNAME'),
      password: this.config.get<string>('MSSQL_PASSWORD'),
      database: organizationDatabase,
      server: this.config.get<string>('MSSQL_HOSTNAME'),
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      port: parseInt(this.config.get<string>('MSSQL_PORT')),
      options: {
        trustServerCertificate: true,
      },
    });

    const parameters = toSqlParameter({
      location,
      expirationDate: moment(new Date()).add(5, 'days').toDate(),
      listId,
      analysisId: type == 'afi' ? 'AFI' : 'FCD',
    });

    await connection.connect();

    let createListResult = [];
    try {
      this.loggerPipe.log('Saving S3 URL at database for list ' + listId + ' and analysis ' + type);
      createListResult = await connection.query(setS3UrlAndExpirationDate, parameters);
    } catch (e) {
      this.loggerPipe.log('Error saving S3 URL at database');
    }

    await connection.disconnect();

    return createListResult;
  }

  public async waitFinishedProcess(inputStream: PassThrough) {
    inputStream.end();
    await finished(inputStream);
    inputStream.removeAllListeners();
    inputStream.destroy();
  }
}
