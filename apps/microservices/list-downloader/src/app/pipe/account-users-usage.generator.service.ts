import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as path from 'path';

import { EmailService, S3Service } from '@wri-monorepos/aws';
import {
  AccountUsersUsageRequest,
  OrganizationUsersAnalysisUsageExport,
  getAccountUsersAnalysisUsageExport,
} from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';
import { ACCOUNT_USERS_USAGE_CSV_HEADER } from '../shared/constants';
import { analysisTypesOptionsNewNames } from '@wri-monorepos/constants';
import { ServerConfigType } from '../../validators/server-config';

@Injectable()
export class AccountUsersAnalysisUsageFileService extends IFileGenerator {
  private readonly logger = new Logger(AccountUsersAnalysisUsageFileService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService<ServerConfigType, true>
  ) {
    super();
  }

  public async makeFile(filters: AccountUsersUsageRequest) {
    const { organizationDatabase, userEmail, startDate, endDate, key: fileName } = filters;

    try {
      this.logger.log(`Generating csv file for organization users analysis usage...`);
      const fileContents = await this.getFileContents({ organizationDatabase, startDate, endDate });
      const filePath = await this.generateCsvFile({
        fileName,
        directory: organizationDatabase.split('-')[1],
        fileContents,
      });

      this.logger.log(`File generatared sucessfully... Uploading to S3...`);
      const fileLocation = await this.uploadFileToS3(filePath);

      this.logger.log(`Notifying user...`);
      await this.notifyUserFileGenerationSuccess({
        emailTo: userEmail,
        fileLocation,
      });

      this.logger.log(`Done.`);
    } catch (error) {
      this.logger.error(error);
      await this.notifyUserFileGenerationFailure({
        emailTo: userEmail,
      });
    }
  }

  private async notifyUserFileGenerationFailure({ emailTo: receivers }: { emailTo: string }) {
    const emailSubject = `[GFWPro] Something went wrong while generating your file export.`;

    try {
      await this.emailService.sendEmail<unknown>(
        this.configService.get('SES_SENDER_EMAIL', { infer: true }),
        [receivers],
        emailSubject,
        'error',
        {}
      );
    } catch (error) {
      throw new Error(
        `[notifyUserFileGenerationFailure] Failed to notify upload failure. ${error.message}`
      );
    }
  }

  private async notifyUserFileGenerationSuccess({
    emailTo: receivers,
    fileLocation,
  }: {
    emailTo: string;
    fileLocation: string;
  }) {
    const emailSubject = `[GFWPro] Your file for your organization's usage by users is ready!`;

    try {
      await this.emailService.sendEmail<{ location: string }>(
        this.configService.get('SES_SENDER_EMAIL', { infer: true }),
        [receivers],
        emailSubject,
        'accountUsersUsageExportSuccess',
        { location: fileLocation }
      );
    } catch (error) {
      throw new Error(
        `[notifyUserFileGenerationSuccess] Failed to notify upload success. ${error.message}`
      );
    }
  }

  private async getFileContents({
    organizationDatabase,
    startDate,
    endDate,
  }: {
    organizationDatabase: string;
    startDate: string;
    endDate: string;
  }): Promise<string[][]> {
    try {
      const accountUsersUsageData = await getAccountUsersAnalysisUsageExport(organizationDatabase, {
        startDate,
        endDate,
      });

      return accountUsersUsageData.map((dataRow: OrganizationUsersAnalysisUsageExport) => {
        return [
          dataRow['Username'],
          dataRow['List ID'] as string,
          this.getAnalysisTypeLabel(dataRow['Analysis Type']),
          dataRow['Hectares'].toString(),
          dataRow['Locations'].toString(),
          (dataRow['Token Cost'] ?? 0).toString(),
          dataRow['Date/Timestamp'],
          dataRow['UI/API'],
        ];
      });
    } catch (error) {
      throw new Error(`[getFileContents] Failed to get file contents. ${error.message}`);
    }
  }

  private async generateCsvFile({
    directory,
    fileName,
    fileContents,
  }: {
    directory: string;
    fileName: string;
    fileContents: string[][];
  }) {
    try {
      const filePath = path.join('/tmp', directory || '', fileName);

      // this creates the directory if it doesn't exist
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

      const fileStreamer = csvWriter({
        separator: ',',
        newline: '\n',
        headers: ACCOUNT_USERS_USAGE_CSV_HEADER,
      });

      const writePromise = new Promise<void>((resolve) => {
        const writeStream = fs.createWriteStream(filePath, {
          flags: 'w',
        });
        writeStream.on('finish', () => {
          resolve();
        });
        writeStream.on('error', (error) => {
          throw new Error(
            `[generateCsvFile] Failed writing data stream into file. ${error.message}`
          );
        });
        // write into the file
        fileStreamer.pipe(writeStream);
        fileContents.forEach((row) => {
          fileStreamer.write(row, 'utf-8');
        });
        fileStreamer.end();
      });
      await writePromise; // this waits for the file stream to finish writing

      return filePath;
    } catch (error) {
      throw new Error(`[generateCsvFile] Failed to get file contents. ${error.message}`);
    }
  }

  private async uploadFileToS3(filePath: string) {
    try {
      const key = path.basename(filePath).split('.')[0];
      const s3Bucket = this.configService.get('AWS_TMP_BUCKET', { infer: true });
      const s3Key = `${process.env.NODE_ENV}/${key}.csv`;
      await this.s3Service.writeFileToS3(filePath, 'text/csv', s3Bucket, s3Key);

      return await this.s3Service.getFileSignedUrl(key, 'csv', s3Bucket);
    } catch (error) {
      throw new Error(`[uploadFileToS3] Failed to upload file to bucket. ${error.message}`);
    }
  }

  private getAnalysisTypeLabel(analysisTypeId: string) {
    if (analysisTypeId === 'ALERTS-BATCH') {
      return 'Weekly Alerts';
    }
    if (analysisTypeId === 'GHG') {
      return 'GHG Emissions';
    }
    const analysisType = analysisTypesOptionsNewNames.find(
      (analysisOpt) => analysisOpt.id === analysisTypeId
    );
    return analysisType ? analysisType.label : analysisTypeId;
  }
}
