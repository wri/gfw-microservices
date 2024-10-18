import * as fs from 'fs';
import * as JSONStream from 'JSONStream';

import { PassThrough } from 'stream';
import { convert } from 'geojson2shp';
import { Logger, Injectable, Scope } from '@nestjs/common';

import {
  ListFieldsFileRequest,
  GFWList,
  ClientStoreConnection,
  Lists
} from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { columnsListName, columnsTemplateId } from '../shared/constants';
import { FilterObject } from '../transform/filter.object';
import { FilterSelection } from '../transform/filter.selection';
import { ConvertObject2Geojson } from '../transform/convert.object.2.geojson';
import { ConvertObject2String } from '../transform/convert.object.2.string';
import { finished } from 'stream/promises';
import { FormatNumber } from '../transform/format.number';
import { ReplaceSpace2Underscore } from '../transform/replace.space.2.underscore';

@Injectable({
  scope: Scope.REQUEST,
})
export class GeometryService extends IPipeService {
  private readonly logger = new Logger(GeometryService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;
  private readonly clientStoreConnection = new ClientStoreConnection();
  async start(filters: ListFieldsFileRequest) {
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

    await this.organizeStream(filters, allFields);
    await this.startEmail(filters);
  }

  process(analysisData) {
    analysisData.forEach((data) => this.inputStream.write(data));
  }

  private async organizeStream(filters: ListFieldsFileRequest, allFields: string[]) {
    const listProperties = await this.getListProperties(filters);
    console.log(listProperties);
    const open =
      filters.type === 'afiVC'
        ? `{"properties": {
            "Location_Name": ${listProperties['Location Name']},
            "Centroid_Country": ${listProperties.Country},
            "Location_HA": ${listProperties.total_area_ha},
            "SBTN_Natural_Forest_HA": ${listProperties.natural_land_area},
            "SBTN_Natural_Forest_Loss_Post_2020_HA": ${listProperties.natural_land_deforested_area},
            "JRC_Forest_HA": ${listProperties.jrc_land_area},
            "JRC_Forest_Loss_Post_2020_HA": ${listProperties.jrc_land_deforested_area},
            "Analysis_Time": ListsAnalysisStatus.UpdateTime,
            "GFWPro_Account": id,
            "Use_Rights": "Full Sharing",
            },
            {\n"type":"FeatureCollection","features":[`
        : '{"type":"FeatureCollection","features":[';
    const close = filters.type === 'afiVC' ? ']}\n}' : ']}';

    const { key, selectedLocationsList, listId, listName } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
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

  async finish(filters: ListFieldsFileRequest) {
    const { listId, key, listName, type } = filters;
    this.logger.log(`(${listId}) - Finished to process data and generate shapefile`);
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    type !== 'afiVC' ? await this.convertGeojsonToSHP(key, listName) : null;
    this.logger.log(`(${listId}) - Data has been zipped`);
    await this.finishProcess(filters);
  }

  private async convertGeojsonToSHP(key: string, listName: string) {
    const options = {
      layer: 'gfw-pro',
      targetCrs: 4326,
    };
    await convert(`/tmp/wri-${key}/${listName}.geojson`, `/tmp/${key}.zip`, options);
  }
  private async getListProperties(filters: ListFieldsFileRequest) {
    const { organizationDatabase, listId, isGFWList } = filters;
    if (!isGFWList) {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = await connection.getRepository(Lists);
      const listProperties = await listRepository.findOne({ where: { id: listId } });

      const rawQuery = `
        SELECT *
        FROM "${listProperties.listTableName}"
        WHERE [Location Name] like '${listProperties.listName}' 
      `;
      const listProperties2 = await connection.query(rawQuery);

      const afiRawQuery = `
        SELECT *
        FROM "AFIAnalysis"
        WHERE [list_id] = ${listId} AND [location_id] > 0
      `;
      const AFIAnalysis = await connection.query(afiRawQuery);
      return { ...listProperties, ...listProperties2[0], ...AFIAnalysis[0] };
    } else {
      const connection = await this.clientStoreConnection.getConnection('gfwpro', [GFWList]);
      const gfwListRepository = await connection.getRepository(GFWList);
      const listProperties = await gfwListRepository.findOne({ where: { id: listId } });
      return listProperties;
    }
  }
}
