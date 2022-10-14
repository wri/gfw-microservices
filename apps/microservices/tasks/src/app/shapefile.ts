/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import { convert } from 'geojson2shp';
import * as asyncPool from "tiny-async-pool";
import * as fs from 'fs';
import * as geojsonStream from 'geojson-stream';
import * as wellknown from 'wellknown';

import { 
  getNumberPagesForAnalysisDataUserList,
  getPaginatedAnalysisDataForUserList,
  getListNameSchema,
  FileGenerationFilter,
} from '@wri-monorepos/sql';
import { logger } from '@wri-monorepos/util';


import { resultColumns, columnsListName, columnsTemplateId } from './constants';

/** @function {getGeoJSONGeometry}
 *   @summary Converts a WKT Geometry to GeoJSON geometry
 *   @param {String} wktGeometry - WKT Geometry to transform
 *   @return {Object} returns GeoJSON geometry
 */
const getGeoJSONGeometry = (wktGeometry: string) => {
  return wellknown(wktGeometry);
};

/** @function {createGeoJSON}
 *   @summary Create a GeoJSON from array objects from SQL server
 *   @param {Array} recordsets - recordsets from stored procedure uspGetListLocations
 *   @return {Object} returns GeoJSON
 */
const createGeoJSON = (recordsets: any) => {
  const geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  recordsets.forEach((location) => {
    const feature = Object.keys(location).reduce(
      (obj, key) => {
        if (key === 'WKTGeometry') {
          obj.geometry = getGeoJSONGeometry(location[key]);
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
};

const getAnalysisData = async (organizationDatabase: string, filter: FileGenerationFilter) => {
  let analysisData = await getPaginatedAnalysisDataForUserList(organizationDatabase, filter);
  const fields =
    columnsTemplateId[analysisData[0].template_id] ?? columnsListName[analysisData[0].list_name] ?? columnsTemplateId[14];

  let allFields = [...fields, ...filter.combinedColumnsSplited];

  if (filter.type === 'result') {
    allFields = [...allFields, ...Object.keys(resultColumns)];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  analysisData = analysisData.map((data) =>
    Object.keys(data)
      .filter((key) => allFields.includes(key))
      .reduce((obj, key) => {
        return Object.assign(obj, {
          [key]: data[key],
        });
      }, {})
  );

  return createGeoJSON(analysisData);
};

const createGeoJSONPage = async (key: string, dir: string, organizationDatabase: string, filter: FileGenerationFilter) => {
  const listOfGeojsonFiles = Array<string>();
  filter.rowsPerPage = 5000;
  
  const { numberOfPages } = await getNumberPagesForAnalysisDataUserList(organizationDatabase, filter);
  logger.info(`Number of pages: ${numberOfPages}`);

  let arrayOfPages = Array.from(Array(numberOfPages).keys());
  arrayOfPages = arrayOfPages.map((value) => value + 1);

  const composeResults = async (i) => {
    const newfilters = { ...filter, page: i, geometry: 1};
    const analysisData = await getAnalysisData(organizationDatabase, newfilters);
    const fileNameIternal = `${dir}/${key}_${i}.geojson`;
    fs.writeFileSync(fileNameIternal, JSON.stringify(analysisData));
    listOfGeojsonFiles.push(fileNameIternal);
    return fileNameIternal;
  };

  for await (const fileNameIternal of asyncPool(5, arrayOfPages, composeResults)) {
    console.log(`Save the file ${fileNameIternal}`);
  }
  return listOfGeojsonFiles;
};

const mergeAllGeoJson = async (key: string , listOfGeojsonFiles: Array<string>) => {
  const mergeGeojson = async (fileNameIternal: string) => {
    const mp = new Promise((resolve, reject) => {
      const out = fs.createWriteStream(`/tmp/${key}.geojson`);
      fs.createReadStream(fileNameIternal)
        .pipe(geojsonStream.parse())
        .pipe(geojsonStream.stringify())
        .pipe(out)
        .on('error', (error: any) => {
          reject(error);
        })
        .on('finish', () => {
          resolve('done');
        });
    });
    await mp;
    return fileNameIternal;
  };

  for await (const mergeFile of asyncPool(1, listOfGeojsonFiles, mergeGeojson)) {
    console.log(`Join the file ${mergeFile} into ${key}.geojson`);
  }
};

const convertGeojsonToSHP = async (key: string) => {
  const options = {
    layer: 'gfw-pro',
    targetCrs: 2154,
  };
  await convert(`/tmp/${key}.geojson`, `/tmp/${key}.zip`, options);
};

export const build = async (key: string, organizationDatabase: string, filter: FileGenerationFilter) => {
  console.log(filter);
  const listSchema = await getListNameSchema(organizationDatabase, filter);
  filter.listName = listSchema.listName;

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

  const listOfGeojsonFiles = await createGeoJSONPage(key, dir, organizationDatabase, filter);
  await mergeAllGeoJson(key, listOfGeojsonFiles);
  await convertGeojsonToSHP(key);
};