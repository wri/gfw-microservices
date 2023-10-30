import { Inject, Logger } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { GenerationFileRequest, setS3UrlAndExpirationDate } from '@wri-monorepos/sql';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
import * as moment from 'moment';

import { SQLUtils } from '@wri-monorepos/sql';

import * as sql from 'mssql';
export abstract class IPipeService {
  private readonly loggerPipe = new Logger(IPipeService.name);

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
    this.s3Service.sendFiletoS3(key, 'zip', 'application/zip', process.env.AWS_TMP_BUCKET);
    this.s3Service
      .getFileSignedUrl(key, 'zip', process.env.AWS_TMP_BUCKET)
      .then(async (location) => {
        await this.finishedEmail(filters, location);
        await this.saveS3UrlAtDatabase(filters, location);
      });
  }

  async saveS3UrlAtDatabase(filters: GenerationFileRequest, location: string) {
    const { listId, organizationDatabase, type } = filters;

    const parameters = [
      { field: 'location', type: sql.VarChar(255), value: location },
      {
        field: 'expirationDate',
        type: sql.DateTime,
        value: moment(new Date()).add(5, 'days').toDate(),
      },
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'analysisId', type: sql.VarChar(10), value: type == 'afi' ? 'AFI' : 'FCD' },
    ];

    const connection = new SQLUtils({
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      database: organizationDatabase,
      server: process.env.MSSQL_HOSTNAME,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      port: parseInt(process.env.MSSQL_PORT),
      options: {
        trustServerCertificate: true,
      },
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
