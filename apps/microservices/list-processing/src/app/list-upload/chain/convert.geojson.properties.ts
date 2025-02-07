import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType } from './types';
import { ListSchema } from '@wri-monorepos/sql';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';

export class ConvertGeojsonProperties extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertGeojsonProperties.name);

  convertGeoJsonProperties = (geoJson: FeatureCollection): FeatureCollection => {
    const featuresFormatted = geoJson.features.map((feature: Feature) => {
      const converted: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(feature.properties)) {
        const [foundColumn] = Object.entries(ListSchema.columns).filter(
          ([, col]) => col.name === key
        );

        if (foundColumn) {
          const [fieldName] = foundColumn;
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
