import * as fs from 'fs';

import { PassThrough } from 'stream';
import { Logger, Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';


import { IPipeService } from './IPipeService';
import { FilterSelection, FilterLocationDontHaveStatus, FilterObject } from '../shared/filter.transform';
import { ConvertToCSV } from '../shared/converter.transform';
import { ManipulateDataForDashboard } from '../shared/operations.transform';

import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';

@Injectable()
export class ForestLossService extends IPipeService{
  private readonly logger = new Logger(ForestLossService.name);
  private inputStream: PassThrough;
  private filters: GenerationFileRequest;

  start(filters: GenerationFileRequest) {
    const { listID, key } = filters;
    this.filters = filters;
    this.logger.log(`(${listID}) - Starting forest loss stream to process data`);

    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream = new PassThrough({
      objectMode: true
    })

    const templateOperation = EXCEL_TEMPLATES['forestLoss'];

    const allFields = [
      ...templateOperation.filter(x => Object.prototype.hasOwnProperty.call(x, 'name')).map(x => x.name),
      ...templateOperation.filter(x => Object.prototype.hasOwnProperty.call(x, 'composites')).flatMap(x => x.composites).map(x => x.attribute),
    ]

    this.organizeStream(filters, allFields)

    fs.writeFileSync(`/tmp/${key}_sensitive_areas_loss_forests.csv`, `${EXCEL_TEMPLATE_HEADERS['forestLoss'].join(',')}\n`);
    this.startEmail(filters);

  }

  process(analysisData: any) {
    const { listName } = this.filters;
    analysisData.forEach((data) => this.inputStream.write({ list_name: listName ,...data}));
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[]) {
    const { listID, selectedLocationsList, key } = filters;
    this.inputStream.removeAllListeners();
    const { forestLoss } = EXCEL_TEMPLATES;

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    })

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterLocationDontHaveStatus(2))
      .pipe(new FilterObject(allFields))
      .pipe(new ManipulateDataForDashboard(forestLoss, 'forestLoss'))
      .pipe(new ConvertToCSV(EXCEL_TEMPLATE_HEADERS['forestLoss']))
      .pipe(fs.createWriteStream(`/tmp/${key}_sensitive_areas_loss_forests.csv`, {flags: 'a'}))

    return this.inputStream;
  }

  finish(filters: GenerationFileRequest) {
    const { listID, key } = filters;
    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream.removeAllListeners();
    this.inputStream.destroy();
  }
}
