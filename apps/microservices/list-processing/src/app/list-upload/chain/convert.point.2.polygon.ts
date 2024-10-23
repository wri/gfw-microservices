import { AbstractHandler, ChainType } from './types';

// ArcGIS imports are ESM only imports, and this code is transpiled into commonJS
// so we need to use eval to import these modules
let Point;
eval ("import('@arcgis/core/geometry/Point.js').then(x=>Point=x.default)");
let GeometryEngine;
eval ("import('@arcgis/core/geometry/geometryEngine.js').then(x=>GeometryEngine=x)");

import { Geometry } from '@wri-monorepos/geo';

const DEFAULT_LOCATION_RADIUS = 4; // kilometers (medium buffer)

export class ConvertPoint2Polygon extends AbstractHandler<ChainType> {
  async geomFromPointRadiusArea(point, featureRadius, featureArea) {
    let radius;
    if (featureRadius) {
      radius = parseFloat(featureRadius);
      if (isNaN(radius) || radius <= 0) {
        throw new Error('Invalid radius value');
      }
    } else if (featureArea) {
      const kilosSquared = parseFloat(featureArea) / 100;
      if (isNaN(kilosSquared) || kilosSquared <= 0) {
        throw new Error('Invalid area value');
      }
      radius = Math.sqrt(kilosSquared / Math.PI).toFixed(2);
    } else {
      radius = DEFAULT_LOCATION_RADIUS;
    }

    return GeometryEngine.geodesicBuffer(point, radius, 'kilometers');
  }

  async geomFromLatLongRadiusArea(latitudeInput, longitudeInput, featureRadius, featureArea) {
    const latitude = parseFloat(latitudeInput);
    const longitude = parseFloat(longitudeInput);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude value');
    }

    const point = new Point({
      latitude,
      longitude,
      spatialReference: { wkid: 4326 },
    });
    return this.geomFromPointRadiusArea(point, featureRadius, featureArea);
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { geojson } = input;
    const { features } = geojson;

    for (const feature of features) {
      const { geometry, properties } = feature;
      if (geometry.type === 'Point') {
        const { coordinates } = geometry;
        const [longitude, latitude] = coordinates;
        const { featureRadius, featureArea } = properties;
        const polygon = await this.geomFromLatLongRadiusArea(
          latitude,
          longitude,
          featureRadius,
          featureArea
        );
        feature.geometry = polygon as unknown as Geometry;
      }
    }
    return await super.handle(input);
  }
}
