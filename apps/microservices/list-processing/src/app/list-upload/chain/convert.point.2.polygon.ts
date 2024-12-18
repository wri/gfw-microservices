import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { Feature, Polygon } from '@wri-monorepos/geo';

// ArcGIS imports are ESM only imports, and this code is transpiled into commonJS
// so we need to use eval to import these modules
const DEFAULT_LOCATION_RADIUS = 4; // kilometers (medium buffer)

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

    return await this.GeometryEngine.geodesicBuffer(point, radius, 'kilometers');
  }

  async geomFromLatLongRadiusArea(latitudeInput, longitudeInput, featureRadius, featureArea) {
    const latitude = parseFloat(latitudeInput);
    const longitude = parseFloat(longitudeInput);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude value');
    }

    const point = new this.Point({
      latitude,
      longitude,
      spatialReference: { wkid: 4326 },
    });
    return this.geomFromPointRadiusArea(point, featureRadius, featureArea);
  }

  async processForFeature(featurePayload: Feature): Promise<Feature> {
    const feature = Object.assign({}, featurePayload);

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
      delete feature.properties.geometry;
      (feature.geometry as Polygon).coordinates = polygon.rings;
      (feature.geometry as Polygon).type = 'Polygon';
    }

    return feature;
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;
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
        delete feature.properties.geometry;
        (feature.geometry as Polygon).coordinates = polygon.rings;
        (feature.geometry as Polygon).type = 'Polygon';
      }
    }
    return request;
  }
}
