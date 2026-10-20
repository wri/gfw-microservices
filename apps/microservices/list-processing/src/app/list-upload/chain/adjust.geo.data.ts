/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';

import * as turf from '@turf/turf';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
export class AdjustGeoData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(AdjustGeoData.name);

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;
    const { features } = geojson as FeatureCollection;

    for (const feature of features) {
      const { properties } = feature;
      const { latitude, longitude } = this.getLatLngFromFeature(feature);
      const hectares = this.getHectaresFromFeature(feature);
      properties.latitude = latitude;
      properties.longitude = longitude;
      properties.analysisArea = hectares;
    }

    return request;
  }

  getHectaresFromFeature = (feature: Feature) => {
    const { properties } = feature;
    const { analysisArea } = properties;

    if (analysisArea) {
      return analysisArea;
    }

    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      const area = turf.area(feature);
      // Convert from square meters to hectares
      return area / 10000;
    }

    return 0;
  };

  getLatLngFromFeature = (feature: Feature) => {
    if (feature.properties.longitude && feature.properties.latitude) {
      return {
        longitude: Number(feature.properties.longitude),
        latitude: Number(feature.properties.latitude),
      };
    }

    try {
      // Use pointOnFeature instead of centerOfMass to ensure the point is always inside the polygon
      // centerOfMass can return points outside the polygon for complex/concave shapes
      const centroid = turf.pointOnFeature(feature.geometry as unknown as turf.AllGeoJSON);
      return {
        longitude: centroid.geometry.coordinates[0],
        latitude: centroid.geometry.coordinates[1],
      };
    } catch (e) {
      this.logger.error('Error in getting centroid from polygon', e);
    }

    if (
      feature.geometry &&
      feature.geometry.type === 'Polygon' &&
      feature.geometry.coordinates.length > 0
    ) {
      // Assuming the coordinates are in the format [ [ [x1, y1], [x2, y2], ... ] ]
      const firstPoint = Array.isArray(feature.geometry.coordinates[0][0])
        ? feature.geometry.coordinates[0][0]
        : feature.geometry.coordinates[0];
      return {
        longitude: firstPoint[0] as number,
        latitude: firstPoint[1] as number,
      };
    }
    if (
      feature.geometry &&
      feature.geometry.type === 'Point' &&
      feature.geometry.coordinates.length > 0
    ) {
      // Assuming the coordinates are in the format [ [ [x1, y1], [x2, y2], ... ] ]
      const firstPoint = feature.geometry.coordinates;
      return {
        longitude: firstPoint[0],
        latitude: firstPoint[1],
      };
    }

    return {
      latitude: 0,
      longitude: 0,
      hasUnanalyzableError: true,
    };
  };
}
