import { Logger, Injectable, Inject } from '@nestjs/common';
import { EmailService, S3Service } from '@wri-monorepos/aws';
import { IFileGenerator } from './i.file.generator';
import {
  AccountUsersUsageRequest,
  OrganizationUsersAnalysisUsageExport,
  getAccountUsersAnalysisUsageExport,
} from '@wri-monorepos/sql';
import { ACCOUNT_USERS_USAGE_CSV_HEADER } from '../shared/constants';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccountUsersAnalysisUsageFileService extends IFileGenerator {
  private readonly logger = new Logger(AccountUsersAnalysisUsageFileService.name);

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(S3Service)
  private readonly s3Service: S3Service;

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
        process.env.SES_SENDER_EMAIL,
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
        process.env.SES_SENDER_EMAIL,
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

      return accountUsersUsageData.map((dataRow: OrganizationUsersAnalysisUsageExport) => [
        dataRow['Username'],
        dataRow['List ID'] as string,
        `${dataRow['Analysis Types']}`, // analysis types is a comma separated value and breaks the csv
        dataRow['Hectares'].toString(),
        dataRow['Locations'].toString(),
        dataRow['Date/Timestamp'],
        dataRow['UI/API'],
      ]);
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
      const [fileName, fileExtension] = filePath.split('.');
      // TODO: should we refactor `sendFiletoS3` to take dynamic file paths instead of fixed `/tmp`?
      await this.s3Service.sendFiletoS3(
        fileName.replace('/tmp/', ''),
        fileExtension,
        'text/csv',
        process.env.AWS_TMP_BUCKET
      );
      return await this.s3Service.getFileSignedUrl(
        fileName.replace('/tmp/', ''),
        fileExtension,
        process.env.AWS_TMP_BUCKET
      );
    } catch (error) {
      throw new Error(`[uploadFileToS3] Failed to upload file to bucket. ${error.message}`);
    }
  }
}
