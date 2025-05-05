import axios from "axios";
import { IdLookupFn, IdTypeHandler } from ".";
import { Logger } from "@nestjs/common";
import { parse } from "wellknown";

// todo: this file is a duplicate of uml.lat.long.lookup
const logger = new Logger('car.lat.long.lookup');

const UML_DATAAPI_URL = `${process.env.GFW_DATASET_API_URL}/sfb_bra_sicar/v202401/query/json`;

const updateOriginalData = (response, originalData) => {
  // Create a hashmap for originalData
  const originalDataMap = {};
  originalData.forEach((data) => {
    originalDataMap[data['ID']] = data;
  });

  // Update originalData with latitude and longitude from response
  response.forEach((item) => {
    const match = originalDataMap[item.cd_imovel];
    if (match) {
      match.geom = item.geom;
    }
  });
};

const getCarIdLatLongChunk = async (carChunk) => {
  logger.log(`CAR Lat/Long Lookup: `, carChunk);
  const sqlIds = carChunk.map((row) => "'" + row['ID'] + "'").join(', ');

  try {
    const response = await axios.get(UML_DATAAPI_URL, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
      },
      params: {
        sql: `SELECT cd_imovel,ST_AsText(geom) FROM mytable WHERE cd_imovel IN (${sqlIds})`,
      },
    });

    const data = response.data.data;
    updateOriginalData(data, carChunk);

    return {
      data: carChunk,
      status: 200,
    };
  } catch (error) {
    logger.error(`something went wrong in the uml lookup: `, error.stack || error);
    const errorStatus = error?.response?.status || 422;
    return {
      detail: error?.message,
      status: errorStatus,
    };
  }
};

export const getCarIdLatLong: IdTypeHandler = async (data) => {
  logger.log(`getCarIdLatLong - total ${data?.length} locations`);

  if (!data?.length) {
    logger.error(`Error /getCarIdLatLong/ - No car Ids`);
    throw new Error('Car IDs Bad Input');
  }
  let fullResult = [];
  const chunkSize = 100;
  for (let index = 0; index < data.length; index += chunkSize) {
    const chunkMax = Math.min(data.length, index + chunkSize);
    logger.log(`getCarIdLatLong - chunk ${index} to ${chunkMax}`);
    const carIdsChunk = data.slice(index, chunkMax);
    const chunkResp = await getCarIdLatLongChunk(carIdsChunk);
    if (chunkResp.status === 200) {
      fullResult = fullResult.concat(chunkResp.data);
    } else {
      logger.error(`getCarIdLatLong - Request Error => ${JSON.stringify(chunkResp)}`);
    }
  }
  logger.log(`getCarIdLatLong - Request Success ${fullResult.length} locations`);
  return fullResult;
};

export const carLookup: IdLookupFn = async (ids) => {
  const sqlIds = ids.map((id) => `'${id}'`).join(',');

  const { data } = await axios.get(UML_DATAAPI_URL, {
    headers: { 'x-api-key': process.env.GFW_DATA_API_KEY },
    params:  {
      sql: `SELECT cd_imovel,ST_AsText(geom) as geom, gfw_geojson FROM mytable WHERE cd_imovel IN (${sqlIds})`,
    },
  });

  return Object.fromEntries(
    data.data.map((d: any) => [
      d.cd_imovel, {geom: parse(d.geom)},
    ])
  );
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
        // sql: `SELECT cd_imovel,ST_AsText(geom) as geom, gfw_geojson FROM mytable LIMIT 5`,
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