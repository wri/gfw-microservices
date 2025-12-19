import axios from 'axios';
import { IdLookupFn } from '.';
import { Logger } from '@nestjs/common';
import * as wkx from 'wkx';
import { readLastUpdatedDateSicar } from './read.last.updated.date.sicar';

const logger = new Logger('car.lat.long.lookup');

const DATA_API_URL = `${process.env.GFW_DATASET_API_URL}/sfb_bra_sicar/v202508/query/json`;

export const carLookup: IdLookupFn = async (ids) => {
  const result = {};

  const sqlIds = ids
    .map((id) => {
      result[id] = {};
      return `'${id}'`;
    })
    .join(',');

  try {
    const sicarLastUpdated = await readLastUpdatedDateSicar();
    const response = await axios.get(DATA_API_URL, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        sql: `SELECT property_c,geom FROM mytable WHERE property_c IN (${sqlIds})`,
      },
    });

    if (response.data.data.length > 0) {
      response.data.data.forEach((found) => {
        if (result[found.property_c]) {
          const buffer = Buffer.from(found.geom, 'hex');
          const parsedBuffer = wkx.Geometry.parse(buffer);
          result[found.property_c] = {
            geometry: parsedBuffer.toGeoJSON(),
          };
          if (sicarLastUpdated.idDataUpdated) {
            result[found.property_c]['ID Updated Date'] = sicarLastUpdated.idDataUpdated;
          }
        }
      });
    }

    if (response.data.data.length < ids.length) {
      ids.forEach((id) => {
        if (!result[id].geometry) {
          result[id] = {
            errorDetails: [`CAR LookUp: did not found lat/long for ${id}`],
          };
        }
      });
    }
  } catch (error) {
    logger.error(`carLookup failed for ${sqlIds}`, error.stack || error);
    ids.forEach((id) => {
      result[id] = {
        errorDetails: [
          `${error.name}: ${error.message}`,
          `There was an error in the CAR lat/long lookup for ${id}`,
        ],
      };
    });
  }

  return result;
};
