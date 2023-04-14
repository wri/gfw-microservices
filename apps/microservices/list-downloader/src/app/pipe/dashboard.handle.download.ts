import * as fs from 'fs';
import { PassThrough } from 'stream';
import { Logger } from '@nestjs/common';

import { ConvertObject2CSV } from '../transform/convert.object.2.csv';
import {
  EXCEL_TEMPLATES,
  EXCEL_TEMPLATE_HEADERS,
  FIELDS_NEEDED_CALCULATION,
} from '../shared/constants';
import { FilterLocationHaveStatus } from '../transform/filter.location.have.status';
import { FilterObject } from '../transform/filter.object';
import { FilterSelection } from '../transform/filter.selection';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './IPipeService';
import { ManipulateDataForDashboard } from '../transform/manipulate.data.dashboard';

export class DashboardHandleDownload extends IPipeService {
  public readonly logger = new Logger(DashboardHandleDownload.name);
  private inputStream: PassThrough;

  start(filters: GenerationFileRequest, table: string, fileSuffix: string) {
    const { listID, key } = filters;
    this.logger.log(
      `(${listID}) - Starting Dashboard download for ${table} stream to process data`
    );
    this.inputStream = new PassThrough({
      objectMode: true,
    });

    const templateOperation = EXCEL_TEMPLATES[table];

    const allFields = this.mountArrayWithAllFields(templateOperation);

    this.organizeStream(filters, allFields, table, fileSuffix);
    fs.writeFileSync(
      `/tmp/${key}_${fileSuffix}.csv`,
      `${EXCEL_TEMPLATE_HEADERS[table].join(',')}\n`
    );
  }

  process(analysisData: any, filters: GenerationFileRequest) {
    const { listName } = filters;
    
    analysisData.forEach((data) =>
      this.inputStream.write({ list_name: listName, ...data })
    );
  }

  private organizeStream(
    filters: GenerationFileRequest,
    allFields: string[],
    table: string,
    fileSuffix: string
  ) {
    const { key, listID, selectedLocationsList, listLevelAnalysis } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    });

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterLocationHaveStatus(2))
      .pipe(new FilterObject(allFields))
      .pipe(
        new ManipulateDataForDashboard(
          EXCEL_TEMPLATES[table],
          listLevelAnalysis
        )
      )
      .pipe(new ConvertObject2CSV(EXCEL_TEMPLATE_HEADERS[table]))
      .pipe(
        fs.createWriteStream(`/tmp/${key}_${fileSuffix}.csv`, { flags: 'a' })
      );

    this.inputStream.on('end', () => {
      this.finish(filters);
    });
  }

  finish(filters: GenerationFileRequest) {
    const { listID } = filters;
    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream.removeAllListeners();
    this.inputStream.destroy();
  }

  mountArrayWithAllFields(templateOperation) {
    const allFields = new Set([
      ...templateOperation
        .filter((x) => Object.prototype.hasOwnProperty.call(x, 'name'))
        .map((x) => x.name),
      ...templateOperation
        .filter((x) => Object.prototype.hasOwnProperty.call(x, 'composites'))
        .flatMap((x) => x.composites)
        .map((x) => x.attribute),
      ...templateOperation
        .filter((x) => Object.prototype.hasOwnProperty.call(x, 'fields'))
        .flatMap((x) => x.fields)
        .map((x) => x.attribute),
      ...templateOperation
        .filter((x) =>
          Object.prototype.hasOwnProperty.call(x, 'additionalFields')
        )
        .flatMap((x) => x.additionalFields)
        .map((x) => x.attribute),
      ...templateOperation
        .filter((x) => Object.prototype.hasOwnProperty.call(x, 'numerators'))
        .flatMap((x) => x.numerators)
        .map((x) => x.extentAttribute),
      ...templateOperation
        .filter((x) => Object.prototype.hasOwnProperty.call(x, 'numerators'))
        .flatMap((x) => x.numerators)
        .map((x) => x.tclAttribute),
      ...templateOperation
        .filter((x) => Object.prototype.hasOwnProperty.call(x, 'following'))
        .flatMap((x) => x.following)
        .map((x) => x.attribute),
      ...FIELDS_NEEDED_CALCULATION,
    ]);
    return Array.from(allFields);
  }
}
