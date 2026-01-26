import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as turf from '@turf/turf';
import { Feature, Polygon, MultiPolygon } from 'geojson';
import { yieldIfLong } from './shared';

export class ValidateLatLongGeojson extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateLatLongGeojson.name);

  public static isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  public static isValidLongitude(lon: number): boolean {
    return lon >= -180 && lon <= 180;
  }

  public static isNumeric(value: number): boolean {
    return !isNaN(value) && isFinite(value);
  }

  public static isValidLatLong(lat: number, lon: number): boolean {
    return (
      this.isNumeric(lat) &&
      this.isNumeric(lon) &&
      this.isValidLatitude(lat) &&
      this.isValidLongitude(lon)
    );
  }

  isValidCountry(country: string): boolean {
    const countryCleaner = country?.toLowerCase().trim();
    return !(
      countryCleaner === 'antarctica' ||
      countryCleaner === '' ||
      countryCleaner === null ||
      countryCleaner === undefined
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validateCoordinates(coordinates: any, country: string): string {
    // Check if coordinates is a single point (array of two numbers)
    if (Array.isArray(coordinates) && coordinates.length === 2 && !Array.isArray(coordinates[0])) {
      const [lon, lat] = coordinates;
      if (!ValidateLatLongGeojson.isValidLatLong(lat, lon)) {
        return 'Invalid coordinates';
      }
      return this.isValidCountry(country) ? '' : 'Invalid location';
    }

    // Otherwise, assume it's an array of points or nested arrays
    for (const coord of coordinates) {
      if (Array.isArray(coord[0])) {
        // If the first element is an array, it's a nested structure (e.g., Polygon)
        const coordResult = this.validateCoordinates(coord, country);
        if (coordResult !== '') {
          return coordResult;
        }
      } else {
        const [lon, lat] = coord;
        if (!ValidateLatLongGeojson.isValidLatLong(lat, lon)) {
          return 'Invalid coordinates';
        }
        if (!this.isValidCountry(country)) {
          return 'Invalid location';
        }
      }
    }
    return '';
  }

  validatePolygon(geometry: Polygon): boolean {
    const feature: Feature<Polygon> = {
      type: 'Feature',
      geometry: geometry,
      properties: {},
    };
    if (!turf.booleanValid(feature)) {
      return false;
    }
    const kinks = turf.kinks(feature as Feature<Polygon>);
    return kinks.features.length === 0;
  }

  async validateMultiPolygon(geometry: MultiPolygon): Promise<boolean> {
    let lastYieldTimestamp = Date.now();
    for (let index = 0; index < geometry.coordinates.length; index++) {
      const polyToValidate: Polygon = {
        type: 'Polygon',
        coordinates: geometry.coordinates[index],
      };
      // each polygon in MultiPolygon must be valid
      if (!this.validatePolygon(polyToValidate)) {
        return false;
      }
      // Next we check if the polygon intersects with any of the other polygons in the MultiPolygon
      const remainingGeoms = geometry.coordinates
        .slice(0, index)
        .concat(geometry.coordinates.slice(index + 1));
      const featureWithRemainingGeoms: Feature<MultiPolygon> = {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: remainingGeoms,
        },
        properties: {},
      };
      const featureToValidate: Feature<Polygon> = {
        type: 'Feature',
        geometry: polyToValidate,
        properties: {},
      };
      if (
        turf.intersect({
          type: 'FeatureCollection',
          features: [featureToValidate, featureWithRemainingGeoms],
        })
      ) {
        return false;
      }
      lastYieldTimestamp = await yieldIfLong(lastYieldTimestamp);
    }

    return true;
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { geojson } = input;

    if ((input.request as RequestNewList).hasUnanalyzableError) {
      return input;
    }
    if (!geojson.type || !geojson.features) {
      throw new Error('Invalid GeoJSON format');
    }

    if (geojson.type === 'FeatureCollection' && geojson.features) {
      let lastYieldTimestamp = Date.now();
      for (let i = geojson.features.length - 1; i >= 0; i--) {
        const feature = geojson.features[i];
        const country = (feature.properties?.country as string) || '';
        const geometry = feature.geometry;

        if (geometry && 'coordinates' in geometry) {
          const coordResult = this.validateCoordinates(geometry.coordinates, country);
          if (coordResult !== '') {
            feature.properties.errorDetails = feature.properties.errorDetails || [];
            (input.request as RequestNewList).hasUnanalyzableError = true;
            (feature.properties.errorDetails as Array<string>).push(coordResult);
            continue;
          }

          if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            let isGeometryValid = true;
            if (geometry.type === 'Polygon') {
              isGeometryValid = this.validatePolygon(geometry as unknown as Polygon);
            } else {
              // geometry.type === 'MultiPolygon'
              isGeometryValid = await this.validateMultiPolygon(
                geometry as unknown as MultiPolygon
              );
            }
            if (!isGeometryValid) {
              feature.properties.errorDetails = feature.properties.errorDetails || [];
              (input.request as RequestNewList).hasUnanalyzableError = true;
              (feature.properties.errorDetails as Array<string>).push('Invalid polygon geometry');
            }
          }
        }
        lastYieldTimestamp = await yieldIfLong(lastYieldTimestamp);
      }
    }
    return input;
  }
}
