import * as Papa from 'papaparse';
import * as sexagesimal from '@mapbox/sexagesimal';
import { Logger } from '@nestjs/common';
import { Geometry, GeoJson } from '@wri-monorepos/geo';

const logger = new Logger('CSV2GeoJSONParser');

interface LocationData {
  [key: string]: string | number | undefined | object;
}

export const csv2geojson = async (csvContent: string, includeLatLon = true): Promise<GeoJson> => {
  const toCamelCase = (str: string) => {
    return str
      .toLowerCase()
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
        if (key !== 'latitude') delete standardizedData[key];
        break;
      }
    }

    for (const key of longitudeKeys) {
      if (data[key] !== undefined) {
        standardizedData['longitude'] = data[key];
        if (key !== 'longitude') delete standardizedData[key];
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
    if (a) latitude = a;
    a = sexagesimal(longitude, 'NS');
    if (a) longitude = a;

    if (!includeLatLon) {
      delete data['latitude'];
      delete data['longitude'];
    }

    if (
      typeof latitude != 'number' ||
      typeof longitude != 'number' ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return {
        ...data,
        error: {
          message: 'Invalid latitude or longitude',
          latitude,
          longitude,
        },
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

  const convertToGeoJSON = (results, reject, resolve) => {
    const { data, errors } = results;
    if (errors.length > 0) {
      logger.error(errors);
      reject(errors);
    }

    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };

    (data as Array<LocationData>).forEach((row: LocationData) => {
      row = standardizeLocationData(row);
      row = createGeometry(row, includeLatLon);
      row = transformKeysToCamelCase(row);

      if (row['error']) {
        logger.error(row['error']);
      } else {
        geoJson.features.push({
          type: 'Feature',
          properties: row,
          geometry: row['geometry'] as Geometry,
        });
      }
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
    Papa.parse(csvContent, {
      worker: true,
      download: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      header: true,
      complete: (results) => convertToGeoJSON(results, reject, resolve),
      error: (error, file) => reject(`${file} - ${error}`),
    });
  });
};
