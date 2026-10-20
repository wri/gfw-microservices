/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { S3Service } from '@wri-monorepos/aws';
import { AbstractHandler, ChainType } from './types';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../../validators/server-config';
import { Logger } from '@nestjs/common';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  FileTooLargeException,
  FILE_TOO_LARGE_MESSAGE_PREFIX,
} from '../../common/fileTooLarge.exception';

export class DownloadS3File extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(DownloadS3File.name);
  private readonly MAX_FILE_SIZE_BYTES = 128 * 1024 * 1024; // 128MB
  private readonly s3Client: S3Client;

  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {
    super();
    this.s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
  }

  private async validateFileSize(key: string, bucket: string): Promise<void> {
    try {
      const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
      const metadata = await this.s3Client.send(headCommand);
      const fileSize = metadata.ContentLength || 0;
      const fileSizeInMB = (fileSize / (1024 * 1024)).toFixed(2);

      if (fileSize > this.MAX_FILE_SIZE_BYTES) {
        this.logger.error(
          `S3 file size (${fileSizeInMB}MB) exceeds maximum allowed size (128MB): s3://${bucket}/${key}`
        );
        throw new FileTooLargeException(fileSizeInMB);
      }

      this.logger.log(
        `S3 file size validation passed: ${fileSizeInMB}MB for s3://${bucket}/${key}`
      );
    } catch (error) {
      if (
        error instanceof FileTooLargeException ||
        (error.message && error.message.includes(FILE_TOO_LARGE_MESSAGE_PREFIX))
      ) {
        // Re-throw our custom error
        throw error;
      }
      // Handle S3 errors (file not found, permission denied, etc.)
      this.logger.error(`Error checking S3 file size for ${key}: ${error.message}`);
      throw new Error(`Unable to check file size in S3: ${error.message}`);
    }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { path } = request.request;
    const bucket = this.config.get<string>('LARGE_PROCESSING_LIST_BUCKET', { infer: true });

    // Validate file size BEFORE downloading to prevent wasting bandwidth and time
    await this.validateFileSize(path, bucket);

    const maxRetries = 3;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const fileDownloadedPath = await this.s3Service.writeS3fileIntoTmp(path, bucket);
        this.logger.log(`Downloaded the file and wrote it into ${fileDownloadedPath}`);
        return { ...request, request: { ...request.request, fileDownloadedPath } };
      } catch (error) {
        this.logger.error(
          `Attempt ${attempt} - Failed to download the file from S3: ${error.message}`,
          error.stack
        );
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.logger.log(`Retrying in ${backoffTime / 1000} seconds...`);
          await delay(backoffTime);
        } else {
          this.logger.error(`All ${maxRetries} attempts failed. Giving up.`);
          throw error; // Re-throw the error after all retries have been exhausted
        }
      }
    }
    return { ...request, request: { ...request.request, fileDownloadedPath: '' } };
  }
}
