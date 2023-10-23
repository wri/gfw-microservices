import * as archiver from 'archiver';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import { PassThrough } from 'stream';
import { Logger, Injectable } from '@nestjs/common';

import { EXCEL_TEMPLATES } from '../shared/constants';
import { FilterObject } from '../transform/filter.object';
import { FilterSelection } from '../transform/filter.selection';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { SumValue } from '../transform/sum.value';
import { IPipeService } from '../pipe/IPipeService';
import { finished } from 'stream/promises';

@Injectable()
export class ResultService extends IPipeService {
  private readonly logger = new Logger(ResultService.name);
  private inputStream: PassThrough;
  private filters: GenerationFileRequest;
  private fileStream: fs.WriteStream;
  private zipStream: fs.WriteStream;

  start(filters: GenerationFileRequest) {
    const { listId, key, listView, listName } = filters;
    this.logger.log(`(${listId}) - Starting result stream to process data`);

    this.inputStream = new PassThrough({
      objectMode: true,
    });

    this.filters = filters;
    const allFields = EXCEL_TEMPLATES[listView];
    const headerPrint = allFields.map((x) => x.name);
    const headerFilter = allFields.map((x) => x.key);
    const columnGetLastValue = allFields.filter((x) => x.analysis).map((x) => x.key);

    this.organizeStream(filters, headerFilter, columnGetLastValue);
    fs.writeFileSync(`/tmp/wri-${key}/${listName}_result.csv`, `${headerPrint.join(',')}\n`);
    this.startEmail(filters);
  }

  process(analysisData) {
    const { listName } = this.filters;
    analysisData.forEach((data) => {
      this.inputStream.write({
        ...data,
        'List Name': listName || '',
      });
    });
  }

  private organizeStream(
    filters: GenerationFileRequest,
    allFields: string[],
    columnGetLastValue: string[] = []
  ) {
    const { listId, selectedLocationsList, key, listName } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}_result.csv`, {
      flags: 'a',
    });
    this.zipStream = fs.createWriteStream(`/tmp/${key}.zip`);

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterObject(allFields))
      .pipe(new SumValue(columnGetLastValue))
      .pipe(
        csvWriter({
          sendHeaders: false,
        })
      )
      .pipe(this.fileStream);

    return this.inputStream;
  }

  async finish(filters: GenerationFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);

    await this.waitFinishedProcess(this.inputStream);
    await finished(this.fileStream);

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });
    archive.append(fs.createReadStream(`/tmp/wri-${key}/${listName}_result.csv`), {
      name: `${listName}_result.csv`,
    });
    archive.pipe(this.zipStream);

    await archive.finalize();

    await finished(this.zipStream);
    this.logger.log(`(${listId}) - Data has been zipped`);
    await this.uploadToS3(filters);
  }
}
