import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { S3Service } from '@wri-monorepos/aws';
import { csv2geojson } from '../parser/csv2geojson.parser';
import * as fs from 'fs';

export class ParserData extends AbstractHandler<ChainType> {
  logger = new Logger(ParserData.name);

  async handle(input: ChainType): Promise<void> {
    try {
      const s3Service = new S3Service();
      const { path } = input.request;
      const bucket = process.env.LARGE_PROCESSING_LIST_BUCKET || '';
      const fileDownloadedPath = await s3Service.writeS3fileIntoTmp(path, bucket);
      const csvContent = fs.readFileSync(fileDownloadedPath, 'utf8');
      this.logger.log(`Downloaded the file and write it into ${fileDownloadedPath}`);
      const geoJson = await csv2geojson(csvContent);
      super.handle({ ...input, geojson: geoJson });
    } catch (error) {
      this.logger.error(error);
      throw Error('Error while parsing the data');
    }
  }
}
