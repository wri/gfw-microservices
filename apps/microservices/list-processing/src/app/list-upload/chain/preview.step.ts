import { AbstractHandler, ChainType } from './types';

export class PreviewStep extends AbstractHandler<ChainType> {
  async handle(request: ChainType): Promise<ChainType> {
    if (request?.geojson?.features) {
      request.geojson.features = request.geojson.features.slice(0, 10);
    }
    return request;
  }
}
