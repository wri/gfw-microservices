import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';

export class ValidateLatLongGeojson extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateLatLongGeojson.name);
  isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  }

  isValidLongitude(lon: number): boolean {
    return lon >= -180 && lon <= 180;
  }

  isInvalidCountry(country): boolean {
    const countryCleaner = country?.toLowerCase().trim();
    return (
      countryCleaner === 'antarctica' ||
      countryCleaner === '' ||
      countryCleaner === null ||
      countryCleaner === undefined
    );
  }

  validateCoordinates(coordinates: any, country: string): boolean {
    // Check if coordinates is a single point (array of two numbers)
    if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
      const [lon, lat] = coordinates;
      return (
        this.isValidLatitude(lat) && this.isValidLongitude(lon) && !this.isInvalidCountry(country)
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
          !this.isValidLatitude(lat) ||
          !this.isValidLongitude(lon) ||
          !this.isInvalidCountry(country)
        ) {
          return false;
        }
      }
    }
    return true;
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
        if (
          geometry &&
          'coordinates' in geometry &&
          !this.validateCoordinates(geometry.coordinates, country)
        ) {
          feature.properties.error = ['Invalid coordinates'];
        }
      }
    }
    return input;
  }
}
