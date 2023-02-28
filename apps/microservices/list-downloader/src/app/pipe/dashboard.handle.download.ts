import * as fs from 'fs';

import { PassThrough } from 'stream';
import { Logger } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { IPipeService } from './IPipeService';
import { FilterSelection, FilterLocationDontHaveStatus, FilterObject } from '../shared/filter.transform';
import { ConvertToCSV } from '../shared/converter.transform';
import { ManipulateDataForDashboard } from '../shared/operations.transform';

import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';

export class DashboardHandleDownload extends IPipeService{
  private readonly logger = new Logger(DashboardHandleDownload.name);
  private inputStream: PassThrough;

  start(filters: GenerationFileRequest, table: string, fileSuffix: string) {
    const { listID, key } = filters;
    this.logger.log(`(${listID}) - Starting Dashboard download for ${table} stream to process data`);

    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream = new PassThrough({
      objectMode: true
    })

    const templateOperation = EXCEL_TEMPLATES[table];

    const allFields = [
      ...templateOperation.filter(x => Object.prototype.hasOwnProperty.call(x, 'name')).map(x => x.name),
      ...templateOperation.filter(x => Object.prototype.hasOwnProperty.call(x, 'composites')).flatMap(x => x.composites).map(x => x.attribute),
    ]

    this.organizeStream(filters, allFields, table, fileSuffix)

    fs.writeFileSync(`/tmp/${key}_${fileSuffix}.csv`, `${EXCEL_TEMPLATE_HEADERS[table].join(',')}\n`);
  }

  process(analysisData: any, filters: GenerationFileRequest) {
    const { listName } = filters;
    analysisData.forEach((data) => this.inputStream.write({ list_name: listName ,...data}));
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[], table: string, fileSuffix: string) {
    const { key, listID, selectedLocationsList, listLevelAnalysis } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    })

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterLocationDontHaveStatus(2))
      .pipe(new FilterObject(allFields))
      .pipe(new ManipulateDataForDashboard(EXCEL_TEMPLATES[table], table, listLevelAnalysis))
      .pipe(new ConvertToCSV(EXCEL_TEMPLATE_HEADERS[table]))
      .pipe(fs.createWriteStream(`/tmp/${key}_${fileSuffix}.csv`, {flags: 'a'}))

    return this.inputStream;
  }

  finish(filters: GenerationFileRequest) {
    const { listID } = filters;
    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream.removeAllListeners();
    this.inputStream.destroy();
  }
}
