import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { Feature } from '@wri-monorepos/geo';

export class ValidateLocationName extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateLocationName.name);

  private isValidLocationName(name: string): boolean {
    // Check if the name contains only alphanumeric characters and spaces
    const alphanumericSpaceRegex = /^[a-zA-Z0-9\s]+$/;
    return alphanumericSpaceRegex.test(name);
  }

  public formatLocationName(name: string): string {
    // Remove newlines and trim whitespace
    return name.replace(/\n/g, '').trim();
  }

  public validateAndFormatLocationName(location: Feature): void {
    const originalName = (location.properties.locationName as string) || '';
    const formattedName = this.formatLocationName(originalName);

    if (!this.isValidLocationName(formattedName)) {
      // Remove offending characters (non-alphanumeric and non-space)
      location.properties.locationName = formattedName.replace(/[^a-zA-Z0-9\s]/g, '');
    } else {
      location.properties.locationName = formattedName; // Store the cleaned name
    }
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { geojson } = input;

    if (!Array.isArray(geojson.features)) {
      throw new Error('Invalid input format: locations should be an array');
    }

    for (const feature of geojson.features) {
      this.validateAndFormatLocationName(feature);
    }

    return input;
  }
}
