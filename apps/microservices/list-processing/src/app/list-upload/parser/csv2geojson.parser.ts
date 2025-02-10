import * as Papa from 'papaparse';
import axios from 'axios';
import sexagesimal from '@mapbox/sexagesimal';
import { Logger } from '@nestjs/common';
import { Geometry, GeoJson, FeatureCollection } from '@wri-monorepos/geo';

interface LocationData {
  [key: string]: string | number | undefined | object;
}

const logger = new Logger('CSV2GeoJSONParser');

const updateOriginalData = (response, originalData) => {
  // Create a hashmap for originalData
  const originalDataMap = {};
  originalData.forEach((data) => {
    originalDataMap[data['Palm Mill ID']] = data;
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
  const millSqlList = millsChunk.map((row) => "'" + row['Palm Mill ID'] + "'").join(', ');
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

export const csv2geojson = async (
  csvContent: string,
  preview = false,
  includeLatLon = true
): Promise<FeatureCollection> => {
  const isPalmMill = (data) => {
    const firstRow = data[0];
    if (Object.keys(firstRow).includes('Palm Mill ID')) {
      return true;
    }
    return false;
  };

  const toCamelCase = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, '');
  };

  const transformKeysToCamelCase = (obj: unknown) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Return if obj is not an object
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => transformKeysToCamelCase(item)); // Recursively handle arrays
    }

    return Object.keys(obj).reduce((acc, key) => {
      const camelCaseKey = toCamelCase(key);
      acc[camelCaseKey] = transformKeysToCamelCase(obj[key]); // Recursively handle nested objects
      return acc;
    }, {});
  };

  const standardizeLocationData = (data: LocationData): LocationData => {
    const latitudeKeys = ['Latitude', 'latitude', 'lat', 'Lat'];
    const longitudeKeys = ['Longitude', 'longitude', 'long', 'Lon', 'lng'];

    const standardizedData: LocationData = { ...data };

    for (const key of latitudeKeys) {
      if (data[key] !== undefined) {
        standardizedData['latitude'] = data[key];
        if (key !== 'latitude') {
          delete standardizedData[key];
        }
        break;
      }
    }

    for (const key of longitudeKeys) {
      if (data[key] !== undefined) {
        standardizedData['longitude'] = data[key];
        if (key !== 'longitude') {
          delete standardizedData[key];
        }
        break;
      }
    }

    return standardizedData;
  };

  const createGeometry = (data: LocationData, includeLatLon: boolean) => {
    let latitude = data['latitude'];
    let longitude = data['longitude'];
    let a: number;

    // Process geographic coordinate data
    // The sexagesimal function is a utility function for converting geographic coordinates from a sexagesimal format (degrees, minutes, seconds) to a decimal format.
    // The parameters 'EW' and 'NS' indicate that the function should interpret the longitude (lonk) as being in the East-West direction and the latitude (latk) as being in the North-South direction.
    a = sexagesimal(latitude, 'EW');
    if (a) {
      latitude = a;
    }
    a = sexagesimal(longitude, 'NS');
    if (a) {
      longitude = a;
    }

    if (!includeLatLon) {
      delete data['latitude'];
      delete data['longitude'];
    }

    if (
      !preview &&
      (typeof latitude != 'number' ||
        typeof longitude != 'number' ||
        isNaN(latitude) ||
        isNaN(longitude))
    ) {
      return {
        ...data,
        errorDetails: [`Invalid latitude or longitude: ${latitude}, ${longitude}`],
      };
    }

    return {
      ...data,
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    };
  };

  const convertToGeoJSON = async (results, reject, resolve) => {
    let { data } = results;
    const { errors } = results;
    if (errors.length > 0) {
      logger.error(errors);
      reject(errors);
    }

    // if has palm oil id need to fill the lat long
    if (isPalmMill(data)) {
      data = await getPalmOilMillLatLong(data);
    }

    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };

    (data as Array<LocationData>).forEach((row: LocationData) => {
      row = standardizeLocationData(row);
      row = createGeometry(row, includeLatLon);
      row = transformKeysToCamelCase(row);

      if (row['errorDetails']) {
        logger.error(row['errorDetails']);
      }
      geoJson.features.push({
        type: 'Feature',
        properties: row,
        geometry: row['geometry'] as Geometry,
      });
    });

    resolve(geoJson);
  };

  if (csvContent === undefined || csvContent === null || csvContent === '') {
    return Promise.resolve({
      type: 'FeatureCollection',
      features: [],
    });
  }

  return await new Promise((resolve, reject) => {
    let config = {
      worker: true,
      download: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      header: true,
      complete: (results) => convertToGeoJSON(results, reject, resolve),
      error: (error, file) => reject(`${file} - ${error}`),
    } as Papa.ParseWorkerConfig;

    if (preview) {
      config = {
        ...config,
        // force the lib to only read this amount of rows
        preview: 20,
      };
    }

    Papa.parse(csvContent, config);
  });
};
