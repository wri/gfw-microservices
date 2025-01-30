import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { Feature, Polygon } from '@wri-monorepos/geo';
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

    const point = new this.Point({
      latitude,
      longitude,
      spatialReference: { wkid: 4326 },
    });
    return this.geomFromPointRadiusArea(point, featureRadius);
  }

  validateAndCalculate(
    analysisArea: number | null,
    analysisRadius: number | null
  ): { analysisRadius: number; analysisArea: number } {
    const pi = Math.PI;

    if (analysisArea === null && analysisRadius === null) {
      throw Error('Error: At least one of analysisArea or analysisRadius must be filled.');
    } else if (analysisArea !== null) {
      // Calculate radius from area
      const kilosSquared = analysisArea / 100;
      const radius = Math.sqrt(kilosSquared / pi);
      return {
        analysisRadius: radius,
        analysisArea,
      };
    } else if (analysisRadius !== null) {
      // Calculate area from radius
      const kiloArea = pi * Math.pow(analysisRadius!, 2);
      const area = kiloArea * 100;
      return {
        analysisArea: area,
        analysisRadius,
      };
    }
    return {
      analysisArea,
      analysisRadius,
    };
  }
  q;
  async convertFeature(feature: Feature): Promise<Feature> {
    const { geometry, properties } = feature;

    if (geometry.type === 'Point') {
      const { coordinates } = geometry;
      const [longitude, latitude] = coordinates;
      const { analysisArea, analysisRadius } = this.validateAndCalculate(
        properties.analysisArea as number,
        properties.analysisRadius as number
      );
      const polygon = await this.geomFromLatLongRadiusArea(latitude, longitude, analysisRadius);
      delete feature.properties.geometry;
      (feature.geometry as Polygon).coordinates = polygon.rings;
      (feature.geometry as Polygon).type = 'Polygon';
      feature.properties.analysisArea = analysisArea;
      feature.properties.analysisRadius = analysisRadius;
    }

    return Object.assign({}, feature);
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;
    const { features } = geojson;

    for (const feature of features) {
      const { geometry, properties } = feature;
      if (geometry.type === 'Point') {
        const { coordinates } = geometry;
        const [longitude, latitude] = coordinates;
        const { analysisArea, analysisRadius } = this.validateAndCalculate(
          properties.analysisArea as number,
          properties.analysisRadius as number
        );

        const polygon = await this.geomFromLatLongRadiusArea(latitude, longitude, analysisRadius);
        delete feature.properties.geometry;
        (feature.geometry as Polygon).coordinates = polygon.rings;
        (feature.geometry as Polygon).type = 'Polygon';
        feature.properties.analysisArea = analysisArea;
        feature.properties.analysisRadius = analysisRadius;
      }
    }
    return request;
  }
}
