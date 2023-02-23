import * as archiver from 'archiver';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';

import { Logger, Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';

import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './IPipeService';

import { FilterObject, FilterSelection, GetLastValue } from '../shared/list.transform';
import { EXCEL_TEMPLATES } from '../shared/constants';

@Injectable()
export class ResultService extends IPipeService {
  private readonly logger = new Logger(ResultService.name);
  private inputStream: PassThrough;
  private filters: GenerationFileRequest;

  start(filters: GenerationFileRequest) {
    const { listID, key, listView } = filters;
    this.logger.log(`(${listID}) - Starting result stream to process data`);
    this.inputStream = new PassThrough({
      objectMode: true
    })

    this.inputStream = new PassThrough({
      objectMode: true
    })

    this.filters = filters;
    const allFields = EXCEL_TEMPLATES[listView];
    const headerPrint = allFields.map(x => x.name)
    const headerFilter = allFields.map(x => x.key)
    const columnGetLastValue = allFields.filter(x => x.analysis).map(x => x.key)

    this.organizeStream(filters, headerFilter, columnGetLastValue)
    fs.writeFileSync(`/tmp/${key}.csv`, `${headerPrint.join(',')}\n`);
    this.startEmail(filters);
  }

  process(analysisData: any) {
    const { listName } = this.filters;
    analysisData.forEach((data: any) => {
      this.inputStream.write({
        ...data,
        'List Name': listName || ''
      })
    })
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[], columnGetLastValue: string[] = []) {
    const { listID, selectedLocationsList, key } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    })

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterObject(allFields))
      .pipe(new GetLastValue(columnGetLastValue))
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

    const output = fs.createWriteStream(`/tmp/${key}.zip`);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
    archive.append(fs.createReadStream(`/tmp/${key}.csv`), { name: `${key}.csv` });
    archive.pipe(output);
    archive.finalize();

    output.on('close', () => {
      this.logger.log(`(${listID}) - Data has been zipped`);
      this.s3Service.sendFiletoS3(key, 'zip', 'application/zip', process.env.AWS_TMP_BUCKET);
      this.s3Service.getFileSignedUrl(key, 'zip', process.env.AWS_TMP_BUCKET).then(location => {
        this.finishedEmail(filters,  location);
      });
    });
  }

}
