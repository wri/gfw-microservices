import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as turf from '@turf/turf';
import { Feature, Polygon } from 'geojson';

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

  validatePolygon(feature: Feature): boolean {
    if (!turf.booleanValid(feature)) {
      return false;
    }
    const kinks = turf.kinks(feature as Feature<Polygon>);
    return kinks.features.length === 0;
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
            if (!this.validatePolygon(feature as Feature)) {
              feature.properties.errorDetails = feature.properties.errorDetails || [];
              (input.request as RequestNewList).hasUnanalyzableError = true;
              (feature.properties.errorDetails as Array<string>).push('Invalid polygon geometry');
            }
          }
        }
      }
    }
    return input;
  }
}
