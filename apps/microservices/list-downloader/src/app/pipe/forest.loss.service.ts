import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';

import { PassThrough } from 'stream';
import { Logger, Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { FilterSelection } from '../shared/list.transform';
import { IPipeService } from './IPipeService';

@Injectable()
export class ForestLossService extends IPipeService{
  private readonly logger = new Logger(ForestLossService.name);
  private inputStream: PassThrough;

  start(filters: GenerationFileRequest) {
    const { listID, key } = filters;
    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream = new PassThrough({
      objectMode: true
    })

    const allFields = [];
    this.organizeStream(filters, allFields)

  }
  process(analysisData: any) {
    analysisData.forEach((data: any) => this.inputStream.write(data));
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[]) {
    const { listID, selectedLocationsList, key } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    })

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(csvWriter({
        sendHeaders: false
      }))
      .pipe(fs.createWriteStream(`/tmp/${key}.csv`, {flags: 'a'}))

    return this.inputStream;
  }

  finish(filters: GenerationFileRequest) {
    const { listID, key } = filters;
    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream.removeAllListeners();
    this.inputStream.destroy();
  }
}
