import axios from 'axios';
import { Logger } from '@nestjs/common';
import { IdLookupFn } from '.';

const logger = new Logger('uml.lat.long.lookup');

const DATA_API_URL = `${process.env.GFW_DATASET_API_URL}/gfw_universal_mill_list/latest/query`;

export const umlLookUp: IdLookupFn = async (ids) => {
  const result = {};

  const sqlIds = ids
    .map((id) => {
      result[id] = {};
      return `'${id}'`;
    })
    .join(',');

  try {
    const response = await axios.get(DATA_API_URL, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        sql: `select uml_id,latitude,longitude from data where uml_id in (${sqlIds})`,
      },
    });

    if (response.data.data.length > 0) {
      response.data.data.forEach((found) => {
        if (result[found.uml_id]) {
          result[found.uml_id] = {
            latitude: found.latitude,
            longitude: found.longitude,
          };
        }
      });
    }
    if (response.data.data.length < ids.length) {
      ids.forEach((id) => {
        if (!result[id].geometry) {
          result[id] = {
            errorDetails: [`UML LookUp: did not found lat/long for ${id}`],
          };
        }
      });
    }
  } catch (error) {
    logger.error(`umlLookUp failed for ${sqlIds}`, error.stack || error);
    ids.forEach((id) => {
      result[id] = {
        errorDetails: [`UML lat/long lookup failed for ${id}`],
      };
    });
  }

  return result;
};
