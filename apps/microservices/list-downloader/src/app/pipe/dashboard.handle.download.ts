import * as fs from 'fs';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
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
import { FormatNumber } from '../transform/format.number';

export class DashboardHandleDownload extends IPipeService {
  public readonly logger = new Logger(DashboardHandleDownload.name);
  private writeStream: PassThrough;
  private fileStream: fs.WriteStream;

  start(filters: GenerationFileRequest, table: string, fileSuffix: string) {
    const { listId, key, listName } = filters;
    this.logger.log(
      `(${listId}) - Starting Dashboard download for ${table} stream to process data`
    );
    this.writeStream = new PassThrough({
      objectMode: true,
    });

    const templateOperation = EXCEL_TEMPLATES[table];

    const allFields = this.mountArrayWithAllFields(templateOperation);

    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${fileSuffix}.csv`,
      `${EXCEL_TEMPLATE_HEADERS[table].join(',')}\n`
    );
    this.organizeStream(filters, allFields, table, fileSuffix);
  }

  process(analysisData, filters: GenerationFileRequest) {
    const { listName } = filters;

    analysisData?.forEach((data) => this.writeStream.write({ list_name: listName, ...data }));
  }

  private organizeStream(
    filters: GenerationFileRequest,
    allFields: string[],
    table: string,
    fileSuffix: string
  ) {
    const { key, listId, selectedLocationsList, listLevelAnalysis, listName } = filters;
    this.writeStream.removeAllListeners();

    this.writeStream.on('error', (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}_${fileSuffix}.csv`, {
      flags: 'a',
    });

    this.writeStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterLocationHaveStatus(2))
      .pipe(new FilterObject(allFields))
      .pipe(new ManipulateDataForDashboard(EXCEL_TEMPLATES[table], listLevelAnalysis))
      .pipe(new FormatNumber())
      .pipe(new ConvertObject2CSV(EXCEL_TEMPLATE_HEADERS[table]))
      .pipe(this.fileStream);
  }

  async finish(filters: GenerationFileRequest) {
    this.logger.log(`(${filters.key}) - Sending end event to stream`);
    this.writeStream.end();
    await finished(this.writeStream);
    await finished(this.fileStream);
    this.writeStream.removeAllListeners();
    this.writeStream.destroy();
    this.fileStream.destroy();
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
        .filter((x) => Object.prototype.hasOwnProperty.call(x, 'additionalFields'))
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
