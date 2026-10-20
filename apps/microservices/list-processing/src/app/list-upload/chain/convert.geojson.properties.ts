/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { ListSchema } from '@wri-monorepos/sql';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';

/**
 * added this step to fix the issue with the naming convention in the GeoJSON conversion
 * we are going to use the ListSchema to map the column names to the field names,
 * but the field doesnt exist inside the geojson is going to be copied as is.
 */
export class ConvertGeojsonProperties extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertGeojsonProperties.name);

  convertGeoJsonProperties = (geoJson: FeatureCollection): FeatureCollection => {
    // Create a mapping of column names to field names
    const columnMapping: Record<string, string> = Object.fromEntries(
      Object.entries(ListSchema.columns).map(([key, col]) => [col.name, key])
    );

    const featuresFormatted = geoJson.features.map((feature: Feature) => {
      const converted: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(feature.properties)) {
        const fieldName = columnMapping[key];

        if (fieldName) {
          converted[fieldName] = value; // Map the value to the key
        } else {
          converted[key] = value;
        }
      }

      feature.properties = converted;

      return feature;
    });

    geoJson.features = featuresFormatted;

    return geoJson;
  };

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;

    const formattedGeojson = this.convertGeoJsonProperties(geojson);

    return {
      ...request,
      geojson: formattedGeojson,
    };
  }
}
