import axios from 'axios';
import { Logger } from "@nestjs/common";
import { IdLookupFn } from ".";
import { parse } from 'wellknown';

const logger = new Logger('uml.lat.long.lookup');

const UML_DATAAPI_URL = `${process.env.GFW_DATASET_API_URL}/gfw_universal_mill_list/latest/query`;

const updateOriginalData = (response, originalData) => {
  // Create a hashmap for originalData
  const originalDataMap = {};
  originalData.forEach((data) => {
    originalDataMap[data['ID']] = data;
  });

  // Update originalData with latitude and longitude from response
  response.forEach((item) => {
    const match = originalDataMap[item.uml_id];
    if (match) {
      match.latitude = item.latitude;
      match.longitude = item.longitude;
    }
  });
};

const getPalmOilMillLatLongChunk = async (millsChunk) => {
  logger.log(`Mill Lat/Long Lookup: `, millsChunk);
  const millSqlList = millsChunk.map((row) => "'" + row['ID'] + "'").join(', ');
  const url = `${process.env.GFW_DATASET_API_URL}/gfw_universal_mill_list/latest/query`;

  try {
    const response = await axios.get(url, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
      },
      params: {
        sql: `select uml_id, latitude, longitude from data where uml_id in (${millSqlList})`,
      },
    });

    const data = response.data.data;
    updateOriginalData(data, millsChunk);

    return {
      data: millsChunk,
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

export const getUniversalMillLatLong = async (data) => {
  logger.log(`getPalmOilMillLatLong - total ${data?.length} locations`);

  if (!data?.length) {
    logger.error(`Error /getPalmOilMillLatLong/ - No mills`);
    throw new Error('Palm Oil Bad Input');
  }
  let fullResult = [];
  const chunkSize = 100;
  for (let index = 0; index < data.length; index += chunkSize) {
    const chunkMax = Math.min(data.length, index + chunkSize);
    logger.log(`getPalmOilMillLatLong - chunk ${index} to ${chunkMax}`);
    const millsChunk = data.slice(index, chunkMax);
    const chunkResp = await getPalmOilMillLatLongChunk(millsChunk);
    if (chunkResp.status === 200) {
      fullResult = fullResult.concat(chunkResp.data);
    } else {
      logger.error(`getPalmOilMillLatLong - Request Error => ${JSON.stringify(chunkResp)}`);
    }
  }
  logger.log(`getPalmOilMillLatLong - Request Success ${fullResult.length} locations`);
  return fullResult;
};

export const umlLookUp: IdLookupFn = async (ids) => {
  let result = {};

  const sqlIds = ids.map((id) => {
    result[id] = {};
    return `'${id}'`
  }).join(',');

  try {
    const response = await axios.get(UML_DATAAPI_URL, {
      headers: { 
        'x-api-key': process.env.GFW_DATA_API_KEY,
      },
      params:  {
        sql: `select uml_id,latitude,longitude from data where uml_id in (${sqlIds})`,
      },
    });

    if (response.data.data.length > 0) {
      response.data.data.forEach((found) => {
        if (result[found.uml_id]) {
          result[found.uml_id] = {
            latitude: found.latitude,
            longitude: found.longitude
          };
        }
      });
    } 
    if (response.data.data.length < ids.length) {
      ids.forEach((id) => {
        if (!result[id].geometry) {
          result[id] = {
            errorDetails: `UML LookUp: did not found lat/long for ${id}`
          }
        }
      });
    }
  } catch (error) {
    logger.error(`umlLookUp failed for ${sqlIds}`, error.stack || error);
    ids.forEach((id) => {
      result[id] = {
        errorDetails: `UML lat/long lookup failed for ${id}`
      }
    });
  }

  return result;
};

export const describeUmlLookup = async () => {
  try {
    const response = await axios.get(UML_DATAAPI_URL, {
      headers: {
        'x-api-key': process.env.GFW_DATA_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        sql: `select * from data limit 5`,
      },
    });

    const data = response.data.data;
    const ids = data.map((row) => (row.uml_id));
    const schema = Object.keys(data[0]).reduce((acc, curr) => {
      acc[curr] ??= typeof data[0][curr];
      return acc;
    }, {});

    /**
     * SELECT uml_id,ST_AsText(geom) as geom, gfw_geojson FROM data LIMIT 5
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