import { parse, GeoJSONGeometryOrNull } from 'wellknown';

import * as JSONStream from 'JSONStream';
import *  as MultiStream from 'multistream';
import { convert } from 'geojson2shp';

import * as asyncPool from "tiny-async-pool";
import * as fs from 'fs';

import { Logger, Injectable } from '@nestjs/common';

import { resultColumns, columnsListName, columnsTemplateId } from './constants';
import {
  GenerationFileRequest,
  UspGetPaginatedAnalysisDataForUserList,
  UspGetAnalysisDataCountForUserList,
} from '@wri-monorepos/sql';

@Injectable()
export class ShapefileService {

  private readonly logger = new Logger(ShapefileService.name);

  constructor(
    private uspGetPaginatedAnalysisDataForUserList:UspGetPaginatedAnalysisDataForUserList,
    private uspGetAnalysisDataCountForUserList:UspGetAnalysisDataCountForUserList,
  ){}

  getGeoJSONGeometry(wktGeometry: string) : GeoJSONGeometryOrNull {
    return parse(wktGeometry);
  }

  createGeoJSON(recordsets: Array<any>) {
    const geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    recordsets.forEach((location) => {
      const feature = Object.keys(location).reduce(
        (obj, key) => {
          if (key === 'WKTGeometry') {
            obj.geometry = this.getGeoJSONGeometry(location[key]);
          } else {
            obj.properties[key] = location[key];
          }
          return obj;
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {},
        }
      );
      geojson.features.push(feature);
    });

    return geojson;
  }

  async getAnalysisData(organizationDatabase: string, filter: GenerationFileRequest) {
    let analysisData = await this.uspGetPaginatedAnalysisDataForUserList.run(organizationDatabase, filter);
    const [firstElem] = analysisData;
    const fields =
      columnsTemplateId[firstElem.template_id] ?? columnsListName[firstElem.list_name] ?? columnsTemplateId[14];

    let allFields = [...fields, ...filter.combinedColumnsSplited];

    if (filter.type === 'result') {
      allFields = [...allFields, ...Object.keys(resultColumns)];
    }

    analysisData = analysisData.map((data) =>
      Object.keys(data)
        .filter((key) => allFields.includes(key))
        .reduce((obj, key) => {
          return Object.assign(obj, {
            [key]: data[key],
          });
        }, {})
    );

    return this.createGeoJSON(analysisData);
  }

  async createGeoJSONPage(key: string, dir: string, organizationDatabase: string, filter: GenerationFileRequest) {
    const listOfGeojsonFiles = Array<string>();

    const numberOfPages = await this.uspGetAnalysisDataCountForUserList.run(organizationDatabase, filter);
    this.logger.log(`Number of pages: ${numberOfPages}`);

    let arrayOfPages = Array.from(Array(numberOfPages).keys());
    arrayOfPages = arrayOfPages.map((value) => value + 1);

    const composeResults = async (i) => {
      const newfilters = { ...filter, page: i, geometry: 1};
      const analysisData = await this.getAnalysisData(organizationDatabase, newfilters);
      const fileNameIternal = `${dir}/${key}_${i}.geojson`;
      fs.writeFileSync(fileNameIternal, JSON.stringify(analysisData));
      listOfGeojsonFiles.push(fileNameIternal);
      return fileNameIternal;
    };

    for await (const fileNameIternal of asyncPool(5, arrayOfPages, composeResults)) {
      this.logger.log(`Save the file ${fileNameIternal}`);
    }
    return listOfGeojsonFiles;
  }

  async mergeAllGeoJson(key: string , listOfGeojsonFiles: Array<string>) {
    const open = '{"type":"FeatureCollection","features":[';
    const close = ']}';

    const streams = []

    for ( let i = 0; i < listOfGeojsonFiles.length; i++) {
      const fileNameIternal = listOfGeojsonFiles[i];
      this.logger.log(`Add file ${fileNameIternal} to the list`);
      streams.push(fs.createReadStream(fileNameIternal))
    }

    const out = fs.createWriteStream(`/tmp/${key}.geojson`, {flags:'r+'});

    const mp = new Promise((resolve, reject) => {
      new MultiStream(streams)
      .pipe(JSONStream.parse(['features', true]))
      .pipe(JSONStream.stringify(open, '\n,\n', close))
      .pipe(out)
      .on('error', (error: any) => {
        reject(error);
      })
      .on('finish', () => {
        out.end();
        resolve('done');
      });

    });


    await mp;
  }

  async convertGeojsonToSHP(key: string) {
    const options = {
      layer: 'gfw-pro',
      targetCrs: 2154,
    };
    await convert(`/tmp/${key}.geojson`, `/tmp/${key}.zip`, options);
  }


  async generate(filter: GenerationFileRequest){
    const { key, organizationDatabase } = filter;

    const dir = `/tmp/${key}-folder`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    filter.combinedColumnsSplited.push('WKTGeometry');

    fs.writeFileSync(
      `/tmp/${key}.geojson`,
      JSON.stringify({
        type: 'FeatureCollection',
        features: [],
      })
    );

    const listOfGeojsonFiles = await this.createGeoJSONPage(key, dir, organizationDatabase, filter);
    await this.mergeAllGeoJson(key, listOfGeojsonFiles);
    await this.convertGeojsonToSHP(key);
  }
}
