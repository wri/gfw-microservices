import * as archiver from 'archiver';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import { PassThrough } from 'stream';
import { Logger, Injectable } from '@nestjs/common';

import { EXCEL_TEMPLATES } from '../shared/constants';
import { FilterObject } from '../transform/filter.object';
import { FilterSelection } from '../transform/filter.selection';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { GetLatestValue } from '../transform/get.latest.value';
import { IPipeService } from '../pipe/IPipeService';

@Injectable()
export class ResultService extends IPipeService {
  private readonly logger = new Logger(ResultService.name);
  private inputStream: PassThrough;
  private filters: GenerationFileRequest;

  start(filters: GenerationFileRequest) {
    const { listID, key, listView } = filters;
    this.logger.log(`(${listID}) - Starting result stream to process data`);

    this.inputStream = new PassThrough({
      objectMode: true,
    });

    this.filters = filters;
    const allFields = EXCEL_TEMPLATES[listView];
    const headerPrint = allFields.map((x) => x.name);
    const headerFilter = allFields.map((x) => x.key);
    const columnGetLastValue = allFields.filter((x) => x.analysis).map((x) => x.key);

    this.organizeStream(filters, headerFilter, columnGetLastValue);
    fs.writeFileSync(`/tmp/${key}.csv`, `${headerPrint.join(',')}\n`);
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
    const { listID, selectedLocationsList, key } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    });

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterObject(allFields))
      .pipe(new GetLatestValue(columnGetLastValue))
      .pipe(
        csvWriter({
          sendHeaders: false,
        })
      )
      .pipe(fs.createWriteStream(`/tmp/${key}.csv`, { flags: 'a' }));

    this.inputStream.on('end', () => {
      const output = fs.createWriteStream(`/tmp/${key}.zip`);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Sets the compression level.
      });
      archive.append(fs.createReadStream(`/tmp/${key}.csv`), {
        name: `${key}.csv`,
      });
      archive.pipe(output);
      archive.finalize();

      output.on('close', async () => {
        this.logger.log(`(${listID}) - Data has been zipped`);
        await this.uploadToS3(filters);
      });
    });

    return this.inputStream;
  }

  async finish(filters: GenerationFileRequest) {
    const { listID } = filters;
    this.logger.log(`(${listID}) - Finished to process result data`);
    this.waitFinishedProcess(this.inputStream);
  }
}
