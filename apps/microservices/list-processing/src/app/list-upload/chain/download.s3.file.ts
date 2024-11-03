import { S3Service } from '@wri-monorepos/aws';
import { AbstractHandler, ChainType } from './types';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../../validators/server-config';
import { Logger } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { getDurationAsString } from './shared';

export class DownloadS3File extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(DownloadS3File.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {
    super();
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { path } = input.request;
    const bucket = this.config.get<string>('LARGE_PROCESSING_LIST_BUCKET', { infer: true });

    const maxRetries = 3;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const start = performance.now();
        const fileDownloadedPath = await this.s3Service.writeS3fileIntoTmp(path, bucket);
        this.logger.log(`Downloaded the file and wrote it into ${fileDownloadedPath}`);

        const end = performance.now();
        this.logger.debug(`Execution time: ${getDurationAsString(start, end)}`);
        return super.handle({ ...input, request: { ...input.request, fileDownloadedPath } });
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
  }
}
