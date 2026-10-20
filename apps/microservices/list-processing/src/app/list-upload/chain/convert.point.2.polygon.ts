/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { Feature, Polygon } from '@wri-monorepos/geo';
import { ValidateLatLongGeojson } from './validate.lat.long.geojson';

// ArcGIS imports are ESM only imports, and this code is transpiled into commonJS
// so we need to use eval to import these modules

const loadPointModule = async () => {
  let Point;
  await eval("import('@arcgis/core/geometry/Point.js').then(x => Point = x.default)");
  return Point;
};

const loadGeometryEngineModule = async () => {
  let GeometryEngine;
  await eval("import('@arcgis/core/geometry/geometryEngine.js').then(x=>GeometryEngine=x)");
  return GeometryEngine;
};

export class ConvertPoint2Polygon extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertPoint2Polygon.name);

  GeometryEngine;
  Point;

  constructor() {
    super();

    loadGeometryEngineModule().then((geometryEngine) => (this.GeometryEngine = geometryEngine));
    loadPointModule().then((point) => (this.Point = point));
  }

  async geomFromPointRadiusArea(point, featureRadius) {
    return await this.GeometryEngine.geodesicBuffer(point, featureRadius, 'kilometers');
  }

  async geomFromLatLongRadiusArea(latitudeInput, longitudeInput, featureRadius) {
    const latitude = parseFloat(latitudeInput);
    const longitude = parseFloat(longitudeInput);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude value');
    }
    if (isNaN(featureRadius)) {
      throw new Error('Invalid radius value');
    }

    const point = new this.Point({
      latitude,
      longitude,
      spatialReference: { wkid: 4326 },
    });
    return await this.geomFromPointRadiusArea(point, featureRadius);
  }

  validateAndCalculate(
    analysisArea: number | null,
    analysisRadius: number | null
  ): { analysisRadius: number; analysisArea: number } {
    const pi = Math.PI;

    if (!analysisArea && !analysisRadius) {
      throw Error('At least one of analysisArea or analysisRadius must be valid');
    } else if (analysisArea < 0 || analysisRadius < 0) {
      throw Error('analysisArea and analysisRadius cannot be negative');
    } else if (analysisArea) {
      // Calculate radius from area
      const kilosSquared = analysisArea / 100;
      analysisRadius = Math.sqrt(kilosSquared / pi);
    } else if (analysisRadius) {
      // Calculate area from radius
      const kiloArea = pi * Math.pow(analysisRadius, 2);
      analysisArea = kiloArea * 100;
    }
    if (analysisRadius > 3 * 1000) {
      throw Error('analysisRadius cannot be greater than 3000 km');
    }
    return {
      analysisArea,
      analysisRadius,
    };
  }

  async convertFeature(feature: Feature, input: ChainType): Promise<Feature> {
    const { geometry, properties } = feature;

    if (geometry.type === 'Point') {
      const { coordinates } = geometry;
      const [longitude, latitude] = coordinates;

      if (ValidateLatLongGeojson.isValidLatLong(latitude, longitude)) {
        try {
          const { analysisArea, analysisRadius } = this.validateAndCalculate(
            Number(properties.analysisArea),
            Number(properties.analysisRadius)
          );
          const polygon = await this.geomFromLatLongRadiusArea(latitude, longitude, analysisRadius);
          delete feature.properties.geometry;
          if (polygon !== null && polygon !== undefined && polygon.rings.length > 0) {
            (feature.geometry as Polygon).coordinates = polygon.rings;
            (feature.geometry as Polygon).type = 'Polygon';
            feature.properties.analysisArea = analysisArea;
            feature.properties.analysisRadius = analysisRadius;
          } else {
            throw new Error('Invalid geometry');
          }
        } catch (error) {
          this.logger.error('Error converting point to polygon: ', error.stack || error);
          feature.properties.errorDetails = feature.properties.errorDetails || [];
          (input.request as RequestNewList).hasUnanalyzableError = true;
          (feature.properties.errorDetails as Array<string>).push(
            'Unable to convert point to polygon: ' + error.message
          );
        }
      } else {
        feature.properties.errorDetails = feature.properties.errorDetails || [];
        (input.request as RequestNewList).hasUnanalyzableError = true;
        (feature.properties.errorDetails as Array<string>).push('Invalid coordinates');
      }
    }

    return Object.assign({}, feature);
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;
    const { features } = geojson;

    try {
      for (const feature of features) {
        await this.convertFeature(feature, request);
      }
    } catch (error) {
      this.logger.error('Error in converting point to polygon', error.stack || error);
      (request.request as RequestNewList).hasUnanalyzableError = true;
    }
    return request;
  }
}
