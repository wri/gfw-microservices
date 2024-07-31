import { Injectable, Logger } from '@nestjs/common';
import { RequestLargeListProcess, ResponseLargeListProcess } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { S3Service } from '@wri-monorepos/aws';
import { csv2geojson } from './parser/csv2geojson.parser';

@Injectable()
export class StartAnalysisService {
  private readonly logger = new Logger(StartAnalysisService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  async run(request: RequestLargeListProcess): Promise<ResponseLargeListProcess> {
    const { path } = request;
    const bucket = this.config.get('LARGE_PROCESSING_LIST_BUCKET', { infer: true });
    const fileDownloadedPath = await this.s3Service.writeS3fileIntoTmp(path, bucket);
    this.logger.log(`Downloaded the file and write it into ${fileDownloadedPath}`);

    const geoJson = csv2geojson(fileDownloadedPath);
    // debug log used to avoid eslint complains about unused variable
    this.logger.debug(geoJson);

    return {
      executionArn: '',
      startDate: '',
    };
  }
}
