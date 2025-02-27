import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('PalmOilCsvAdjust');

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
    const errorStatus = error?.response?.status || 422;
    return {
      detail: error?.message,
      status: errorStatus,
    };
  }
};

const getPalmOilMillLatLong = async (data) => {
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

const isPalmMill = (data) => {
  const firstRow = data[0] || {};

  const hasValidKey = Object.keys(firstRow).includes('ID');

  if (hasValidKey) {
    return true;
  }

  return false;
};

export const palmOilCsvAdjust = async (data: Record<string, unknown>[]) => {
  if (isPalmMill(data)) {
    data = await getPalmOilMillLatLong(data);
  }
  return data;
};
