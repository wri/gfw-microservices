import * as fs from 'fs';
import * as JSONStream from 'JSONStream';

import { PassThrough } from 'stream';
import { Logger, Injectable, Scope } from '@nestjs/common';

import { ListFieldsFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { ColumnResolverService } from '../shared/column-resolver.service';
import { FilterObject } from '../transform/filter.object';
import { FilterSelection } from '../transform/filter.selection';
import { ConvertObject2Geojson } from '../transform/convert.object.2.geojson';
import { ConvertObject2String } from '../transform/convert.object.2.string';
import { finished } from 'stream/promises';
import { FormatNumber } from '../transform/format.number';
import { ReplaceSpace2Underscore } from '../transform/replace.space.2.underscore';
import { getAllFilesAndZip } from '../shared/file.utils';
@Injectable({
  scope: Scope.REQUEST,
})
export class AfiGeometryService extends IPipeService {
  private readonly logger = new Logger(AfiGeometryService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  constructor(private readonly columnResolverService: ColumnResolverService) {
    super();
  }

  async start(filters: ListFieldsFileRequest) {
    const { listId, key, combinedColumnsSplitted, listName } = filters;
    this.logger.log(`(${listId}) - Starting verifiable credentials stream to process data`);
    this.inputStream = new PassThrough({
      objectMode: true,
    });

    filters.combinedColumnsSplitted.push('WKTGeometry');
    filters.combinedColumnsSplitted.push(
      'organizationDatabase',
      'list_id',
      'Country',
      'location_id'
    );
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}.json`,
      JSON.stringify({
        type: 'FeatureCollection',
        features: [],
      })
    );

    // Use the column resolver for commodity-based column resolution
    const columnResolution = await this.columnResolverService.resolveColumns(listId);

    this.logger.log(
      `(${listId}) - Column resolution: ${columnResolution.resolvedFrom} (source: ${columnResolution.source})`
    );

    let allFields = [...columnResolution.columns, ...combinedColumnsSplitted];
    allFields = [...new Set(allFields)];

    await this.organizeStream(filters, allFields);
    await this.startEmail(filters);
  }

  process(analysisData, newFilters = {}) {
    if (analysisData.length > 0) {
      analysisData.forEach(
        (data) => (data.organizationDatabase = newFilters['organizationDatabase'])
      );
      analysisData.forEach((data) => this.inputStream.write(data));
    }
  }

  private async organizeStream(filters: ListFieldsFileRequest, allFields: string[]) {
    const open = '[\n';
    const close = ']\n';

    const { key, selectedLocationsList, listId, listName } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}.json`, { flags: 'r+' });

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterObject(allFields))
      .pipe(new ReplaceSpace2Underscore())
      .pipe(new FormatNumber())
      .pipe(new ConvertObject2Geojson())
      .pipe(new ConvertObject2String())
      .pipe(JSONStream.parse(['features', true]))
      .pipe(JSONStream.stringify(open, '\n,\n', close))
      .pipe(this.fileStream);

    return this.inputStream;
  }

  async finish(filters: ListFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process data and generate shapefile`);
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    await getAllFilesAndZip(filters); // file was zipped befored process finished
    this.logger.log(`(${listId}) - Data has been zipped`);
    await this.finishProcess(filters);
  }
}
