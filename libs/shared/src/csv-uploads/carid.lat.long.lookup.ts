import axios from "axios";
import { IdLookupFn } from ".";
import { Logger } from "@nestjs/common";
import { parse } from "wellknown";

const logger = new Logger('car.lat.long.lookup');

const UML_DATAAPI_URL = `${process.env.GFW_DATASET_API_URL}/sfb_bra_sicar/v202401/query/json`;

export const carLookup: IdLookupFn = async (ids) => {
  let result = {};

  const sqlIds = ids.map((id) => {
    result[id] = {};
    return `'${id}'`
  }).join(',');

  try {
    const response = await axios.get(UML_DATAAPI_URL, {
      headers: { 'x-api-key': process.env.GFW_DATA_API_KEY },
      params:  {
        sql: `SELECT cd_imovel,ST_AsText(geom) as geom, gfw_geojson FROM mytable WHERE cd_imovel IN (${sqlIds})`,
      },
    });

    if (response.data.data.length > 0) {
      response.data.data.forEach((found) => {
        if (result[found.cd_imovel]) {
          result[found.cd_imovel] = {
            geometry: parse(found.geom)
          };
        }
      });
    }

    if (response.data.data.length < ids.length) {
      ids.forEach((id) => {
        if (!result[id].geometry) {
          result[id] = {
            errorDetails: `CAR LookUp: did not found lat/long for ${id}`
          }
        }
      });
    }
  } catch (error) {
    logger.error(`carLookup failed for ${sqlIds}`, error.stack || error);
    ids.forEach((id) => {
      result[id] = {
        errorDetails: `CAR lat/long lookup failed for ${id}`
      }
    });
  }

  return result
};

export const describeCarLookup = async () => {
  try {
    const response = await axios.get(UML_DATAAPI_URL, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        sql: `select * from mytable limit 5`,
      },
    });

    const data = response.data.data;
    const ids = data.map((row) => row.cd_imovel);
    const schema = Object.keys(data[0]).reduce((acc, curr) => {
      acc[curr] ??= typeof data[0][curr];
      return acc;
    }, {});

    /**
     * SELECT cd_imovel,ST_AsText(geom) as geom, gfw_geojson FROM mytable LIMIT 5
     * geom => geometry binary
     * ST_AsText(geom) => geometry text parsable by wellknown
     * gfw_geojson => is equal wellknown.parse(ST_AsText(geom))?
     */
    // const parsedGeoms = data.map((row) => {
    //   return {
    //     geom: parse(row.geom),
    //   }
    // });

    return {
      sample: {
        ids,
        data,
      },
      schema,
    };
  } catch (error) {
    logger.error(`Something went wrong with the dataApi request`);
    return [error.stack || error];
  }
}