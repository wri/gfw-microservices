import { Inject, Logger } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
import { addDays } from 'date-fns';

import {
  BasicFieldsFileRequest,
  setS3UrlAndExpirationDate,
  toSqlParameter,
} from '@wri-monorepos/sql';
import { SQLUtils } from '@wri-monorepos/sql';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { getDownloadFilename } from '../shared/download-filename';

export abstract class IPipeService {
  private readonly loggerPipe = new Logger(IPipeService.name);

  private EXPIRE_IN_FIVE_DAYS = 5;
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
    const { listName, userEmail } = filters;
    if (userEmail) {
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
    const { listName, userEmail } = filters;
    if (userEmail) {
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
    const { listName, userEmail } = filters;
    if (userEmail) {
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
    const filePath = `/tmp/${key}.zip`;
    const s3Bucket = this.configService.get('AWS_TMP_BUCKET', { infer: true });
    const s3Key = `${process.env.NODE_ENV}/${key}.zip`;

    await this.s3Service.writeFileToS3(filePath, 'application/zip', s3Bucket, s3Key);
    return await this.s3Service.getFileSignedUrl(
      key,
      'zip',
      s3Bucket,
      getDownloadFilename(filters)
    );
  }

  async saveS3UrlAtDatabase(filters: BasicFieldsFileRequest, location: string) {
    const { listId, organizationDatabase, type, file, isGFWList } = filters;
    let formattedAnalysisId = 'FCD';
    switch (type) {
      case 'afiVC':
      case 'afi':
        formattedAnalysisId = 'AFI';
        break;
      case 'alerts':
        formattedAnalysisId = 'ALERTS';
        break;
      case 'ghg':
        formattedAnalysisId = 'GHG';
        break;
    }
    const parameters = toSqlParameter({
      location,
      expirationDate: addDays(new Date(), this.EXPIRE_IN_FIVE_DAYS),
      bundleCreationTime: new Date(),
      listId,
      analysisId: formattedAnalysisId,
    });

    if (
      !['input_csv', 'input_shapefile', 'input_geojson', 'results_csv'].includes(
        `${type}_${file}`
      ) &&
      !isGFWList
    ) {
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
