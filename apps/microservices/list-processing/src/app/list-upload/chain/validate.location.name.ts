/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { Feature } from '@wri-monorepos/geo';

export class ValidateLocationName extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateLocationName.name);

  private isValidLocationName(name: string): boolean {
    // Empty string is considered valid
    if (!name) {
      return true;
    }

    // Check if the name contains alphanumeric characters, spaces, and allowed special characters
    const validCharsRegex = /^[a-zA-Z0-9\s[\]().\-_]+$/;
    return validCharsRegex.test(name);
  }

  public formatLocationName(name: string): string {
    // Remove newlines, nulls, and trim whitespace
    return name.replace(/[\n\0]/g, '').trim();
  }

  public validateAndFormatLocationName(location: Feature): void {
    // Handle null properties
    if (!location.properties) {
      location.properties = { locationName: '' };
      return;
    }

    const originalName =
      location.properties.locationName === undefined
        ? 'undefined'
        : String(location.properties.locationName || '');
    const formattedName = this.formatLocationName(originalName);

    if (!this.isValidLocationName(formattedName)) {
      // Remove offending characters (non-alphanumeric, non-space, and non-allowed special characters)
      location.properties.locationName = formattedName.replace(/[^a-zA-Z0-9\s[\]().\-_]/g, '');
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
