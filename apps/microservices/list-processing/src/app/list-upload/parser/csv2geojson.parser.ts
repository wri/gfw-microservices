import * as Papa from 'papaparse';
import sexagesimal from '@mapbox/sexagesimal';
import { Logger } from '@nestjs/common';
import { Geometry, GeoJson, FeatureCollection } from '@wri-monorepos/geo';
import { csvLatLongIdBasedTransformer } from '@wri-monorepos/shared';

interface LocationData {
  [key: string]: string | number | undefined | object;
}

const logger = new Logger('CSV2GeoJSONParser');

// fake geometry so followon chains can proceed.  This location is in the ocean, so not valid.
const fakeGeometry: Geometry = {
  type: 'Point',
  coordinates: [0, 0],
};

export const csv2geojson = async (
  csvContent: string,
  preview = false,
  includeLatLon = true
): Promise<FeatureCollection> => {
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
      data['latitude'] = null;
      data['longitude'] = null;
      return {
        ...data,
        geometry: fakeGeometry,
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
    const geoJson: GeoJson = {
      type: 'FeatureCollection',
      features: [],
    };

    let { data } = results;
    const { errors } = results;
    if (errors.length > 0) {
      logger.error(errors);
      errors.forEach((error) => {
        geoJson.features.push({
          type: 'Feature',
          properties: {
            'Location Name': `Row ${error.row}`,
            errorDetails: [error.message],
          },
          geometry: fakeGeometry,
        });
      });
      return resolve(geoJson);
    }

    // id based system
    try {
      data = await csvLatLongIdBasedTransformer(data);
    } catch (error) {
      logger.error('Error looking up ID', error.stack || error);
      geoJson.features.push({
        type: 'Feature',
        properties: {
          'Location Name': 'Unknown',
          errorDetails: [error.message],
        },
        geometry: fakeGeometry,
      });
      return resolve(geoJson);
    }

    (data as Array<LocationData>).forEach((row: LocationData) => {
      // geometries are included in csvLatLongIdBasedTransformer
      if (!row['geometry']) {
        row = standardizeLocationData(row);
        row = createGeometry(row, includeLatLon);
      }

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
      skipEmptyLines: 'greedy',
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
