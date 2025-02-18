import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';

export class PutListAsDraft extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(PutListAsDraft.name);

  async handle(input: ChainType): Promise<ChainType> {
    const { request } = input;
    const { saveAsDraft, hasGeometryError = false } = request as RequestNewList;

    if (saveAsDraft) {
      return input;
    }

    if (hasGeometryError) {
      this.logger.error('Should put list as draft, has invalid coordinates or polygon geometry');
      return {
        ...input,
        request: { ...request, saveAsDraft: true },
      };
    }
    return input;
  }
}
