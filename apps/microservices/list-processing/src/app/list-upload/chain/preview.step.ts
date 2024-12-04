import { AbstractHandler, ChainType } from './types';

export class PreviewStep extends AbstractHandler<ChainType> {
  async handle(request: ChainType): Promise<ChainType> {
    // Check if the geojson property exists and has features
    if (request.geojson && request.geojson.features) {
      // Filter the first 10 features
      request.geojson.features = request.geojson.features.slice(0, 10);
    }

    // Continue with the next handler in the chain or return the modified request
    return request;
  }
}
