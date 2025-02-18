import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';

export class ValidateLatLongGeojson extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateLatLongGeojson.name);

  isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  isValidLongitude(lon: number): boolean {
    return lon >= -180 && lon <= 180;
  }

  isNumeric(value: any): boolean {
    return !isNaN(value) && isFinite(value);
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

  validateCoordinates(coordinates: any, country: string): boolean {
    // Check if coordinates is a single point (array of two numbers)
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      const [lon, lat] = coordinates;
      return (
        this.isNumeric(lat) &&
        this.isNumeric(lon) &&
        this.isValidLatitude(lat) &&
        this.isValidLongitude(lon) &&
        this.isValidCountry(country)
      );
    }

    // Otherwise, assume it's an array of points or nested arrays
    for (const coord of coordinates) {
      if (Array.isArray(coord[0])) {
        // If the first element is an array, it's a nested structure (e.g., Polygon)
        if (!this.validateCoordinates(coord, country)) {
          return false;
        }
      } else {
        const [lon, lat] = coord;
        if (
          !this.isNumeric(lat) ||
          !this.isNumeric(lon) ||
          !this.isValidLatitude(lat) ||
          !this.isValidLongitude(lon) ||
          !this.isValidCountry(country)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validatePolygon(_geometry: unknown): boolean {
    // Implement polygon validation logic (e.g., check for open or self-intersecting polygons)
    // This is a placeholder for actual polygon validation logic
    return true; // Replace with actual validation
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { geojson } = input;

    if (!geojson.type || !geojson.features) {
      throw new Error('Invalid GeoJSON format');
    }

    if (geojson.type === 'FeatureCollection' && geojson.features) {
      for (let i = geojson.features.length - 1; i >= 0; i--) {
        const feature = geojson.features[i];
        const country = (feature.properties?.country as string) || '';
        const geometry = feature.geometry;

        if (geometry && 'coordinates' in geometry) {
          if (!this.validateCoordinates(geometry.coordinates, country)) {
            feature.properties.errorDetails = feature.properties.errorDetails || [];
            (input.request as RequestNewList).hasGeometryError = true;
            (feature.properties.errorDetails as Array<string>).push('Invalid coordinates');
          }

          if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            if (!this.validatePolygon(geometry)) {
              feature.properties.errorDetails = feature.properties.errorDetails || [];
              (input.request as RequestNewList).hasGeometryError = true;
              (feature.properties.errorDetails as Array<string>).push('Invalid polygon geometry');
            }
          }
        }
      }
    }
    return input;
  }
}
