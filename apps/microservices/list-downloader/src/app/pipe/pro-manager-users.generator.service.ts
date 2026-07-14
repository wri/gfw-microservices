import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

import { EmailService, S3Service } from '@wri-monorepos/aws';
import {
  ProManagerUsersExportRequest,
  ProManagerUserExportRecord,
  getProManagerUsersExport,
} from '@wri-monorepos/sql';
import { UserAccessLevel } from '@wri-monorepos/constants';
import { IFileGenerator } from './i.file.generator';
import { PRO_MANAGER_USERS_CSV_HEADER } from '../shared/constants';
import { ServerConfigType } from '../../validators/server-config';

const ACCESS_LEVEL_LABELS: Record<number, string> = {
  [UserAccessLevel.ADMIN]: 'Administrator',
  [UserAccessLevel.EDITOR]: 'Editor',
  [UserAccessLevel.VIEWER]: 'Viewer',
};

@Injectable()
export class ProManagerUsersFileService extends IFileGenerator {
  private readonly logger = new Logger(ProManagerUsersFileService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService<ServerConfigType, true>
  ) {
    super();
  }

  public async makeFile(filters: ProManagerUsersExportRequest) {
    const { userEmail, key: fileName } = filters;

    try {
      this.logger.log(`Generating csv file for Pro Manager users export...`);
      const fileContents = await this.getFileContents();
      const filePath = await this.generateCsvFile({ fileName, fileContents });

      this.logger.log(`File generated successfully... Uploading to S3...`);
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
    const emailSubject = `[GFWPro] Your GFW Pro users export is ready!`;

    try {
      await this.emailService.sendEmail<{ location: string }>(
        this.configService.get('SES_SENDER_EMAIL', { infer: true }),
        [receivers],
        emailSubject,
        'proManagerUsersExportSuccess',
        { location: fileLocation }
      );
    } catch (error) {
      throw new Error(
        `[notifyUserFileGenerationSuccess] Failed to notify upload success. ${error.message}`
      );
    }
  }

  private async getFileContents(): Promise<string[][]> {
    try {
      const users = await getProManagerUsersExport();

      return users.map((user: ProManagerUserExportRecord) => [
        user.first_name ?? '',
        user.last_name ?? '',
        user.email ?? '',
        this.getAccessLevelLabel(user.access_level_id),
        user.organization_name ?? '',
        this.formatExportDate(user.user_activated_time),
        this.formatExportDate(user.deactivation_date),
        user.country ?? '',
        user.language ?? '',
      ]);
    } catch (error) {
      throw new Error(`[getFileContents] Failed to get file contents. ${error.message}`);
    }
  }

  private async generateCsvFile({
    fileName,
    fileContents,
  }: {
    fileName: string;
    fileContents: string[][];
  }) {
    try {
      const filePath = path.join('/tmp', fileName);

      // this creates the directory if it doesn't exist
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

      const fileStreamer = csvWriter({
        separator: ',',
        newline: '\n',
        headers: PRO_MANAGER_USERS_CSV_HEADER,
      });

      const writePromise = new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath, {
          flags: 'w',
        });
        writeStream.on('finish', () => {
          resolve();
        });
        writeStream.on('error', (error) => {
          reject(
            new Error(`[generateCsvFile] Failed writing data stream into file. ${error.message}`)
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
      throw new Error(`[generateCsvFile] Failed to generate csv file. ${error.message}`);
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

  private getAccessLevelLabel(accessLevelId: number | null) {
    return accessLevelId != null ? ACCESS_LEVEL_LABELS[accessLevelId] ?? '' : '';
  }

  // Formats a date value as `DD MMM YYYY` (e.g. `23 Sep 2026`). Returns an empty
  // string for null/empty/invalid values.
  private formatExportDate(value: Date | string | null) {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return format(date, 'dd MMM yyyy');
  }
}
