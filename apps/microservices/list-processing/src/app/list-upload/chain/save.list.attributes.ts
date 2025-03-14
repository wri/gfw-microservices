import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ListAttributesRecord, saveListAttributes } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
// todo: these changes goes for [GPV-4085]
export class SaveListAttributes extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(SaveListAttributes.name);
  async saveLocAttributesToListAttributes(
    orgDb: string,
    attributes: ListAttributesRecord[]
  ): Promise<void> {
    await saveListAttributes(orgDb, attributes);
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { attributes, request } = input;
    const { organization_database: orgDb } = request as RequestNewList;

    try {
      await saveListAttributes(orgDb, attributes);
    } catch (error) {
      this.logger.error(`Something went wrong.`, error.stack || error);
    }

    return input;
  }
}
