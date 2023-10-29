import * as fs from 'fs';
import * as JSONStream from 'JSONStream';

import { PassThrough } from 'stream';
import { convert } from 'geojson2shp';
import { Logger, Injectable } from '@nestjs/common';

import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/IPipeService';
import { columnsListName, columnsTemplateId } from '../shared/constants';
import { FilterObject } from '../transform/filter.object';
import { FilterSelection } from '../transform/filter.selection';
import { ConvertObject2Geojson } from '../transform/convert.object.2.geojson';
import { ConvertObject2String } from '../transform/convert.object.2.string';
import { finished } from 'stream/promises';
import { FormatNumber } from '../transform/format.number';
import { ReplaceSpace2Underscore } from '../transform/replace.space.2.underscore';

@Injectable()
export class ShapefileService extends IPipeService {
  private readonly logger = new Logger(ShapefileService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  start(filters: GenerationFileRequest) {
    const { listId, key, templateId, combinedColumnsSplitted, listName } = filters;
    this.logger.log(`(${listId}) - Starting shapefile stream to process data`);
    this.inputStream = new PassThrough({
      objectMode: true,
    });

    filters.combinedColumnsSplitted.push('WKTGeometry');

    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}.geojson`,
      JSON.stringify({
        type: 'FeatureCollection',
        features: [],
      })
    );

    const fields =
      columnsTemplateId[templateId] ?? columnsListName[templateId] ?? columnsTemplateId[14];
    let allFields = [...fields, ...combinedColumnsSplitted];
    allFields = [...new Set(allFields)];

    this.organizeStream(filters, allFields);
    this.startEmail(filters);
  }

  process(analysisData) {
    analysisData.forEach((data) => this.inputStream.write(data));
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[]) {
    const open = '{"type":"FeatureCollection","features":[';
    const close = ']}';

    const { key, selectedLocationsList, listId, listName } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}.geojson`, { flags: 'r+' });

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

  async finish(filters: GenerationFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Finished to process data and generate shapefile`);
    await this.waitFinishedProcess(this.inputStream);
    await finished(this.fileStream);
    await this.convertGeojsonToSHP(key, listName);
    this.logger.log(`(${listId}) - Data has been zipped`);
    await this.uploadToS3(filters);
  }

  private async convertGeojsonToSHP(key: string, listName: string) {
    const options = {
      layer: 'gfw-pro',
      targetCrs: 4326,
    };
    await convert(`/tmp/wri-${key}/${listName}.geojson`, `/tmp/${key}.zip`, options);
  }
}
