import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ListAttributesRecord, saveListAttributes } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';

export class SaveListAttributes extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(SaveListAttributes.name);

  async handle(input: ChainType): Promise<ChainType> {
    const { attributes, request } = input;
    const { organization_database: orgDb } = request as RequestNewList;

    try {
      await saveListAttributes(orgDb, attributes);
    } catch (error) {
      this.logger.error(`Something went wrong.`, error.stack || error);
      throw error;
    }

    return input;
  }
}
