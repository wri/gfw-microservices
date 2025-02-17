import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';

export class PutListAsDraft extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(PutListAsDraft.name);

  async handle(input: ChainType): Promise<ChainType> {
    const { request } = input;
    const { saveAsDraft } = request as RequestNewList;

    if (saveAsDraft) {
      return input;
    }

    const features = input.geojson.features;

    for (const feature of features) {
      const { properties } = feature;
      const { errorDetails } = properties;

      if (
        (errorDetails as Array<string>).includes('Invalid coordinates') ||
        (errorDetails as Array<string>).includes('Invalid polygon geometry')
      ) {
        this.logger.error('Should put list as draft, has invalid coordinates or polygon geometry');
        return {
          ...input,
          request: {
            ...request,
            saveAsDraft: true,
          },
        };
      }
    }
    return input;
  }
}
