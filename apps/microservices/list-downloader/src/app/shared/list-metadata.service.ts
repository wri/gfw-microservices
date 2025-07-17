import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientStoreConnection } from '@wri-monorepos/sql';
import { Lists } from '@wri-monorepos/sql';
import { ServerConfigType } from '../../validators/server-config';

export interface ListMetadata {
  id: number;
  templateId: number;
  version: number;
  commodity: string | null;
  listName: string;
  locationClassification: string;
}

@Injectable()
export class ListMetadataService {
  private readonly logger = new Logger(ListMetadataService.name);

  constructor(private readonly configService: ConfigService<ServerConfigType, true>) {}

  async getListMetadata(
    listId: number,
    organizationDatabase?: string,
    isGFWList = false
  ): Promise<ListMetadata | null> {
    const dbName = isGFWList
      ? this.configService.get('MSSQL_DATABASE', { infer: true })
      : organizationDatabase;

    if (!dbName) {
      this.logger.error('No database name provided');
      return null;
    }

    try {
      const clientStoreConnection = new ClientStoreConnection();
      const connection = await clientStoreConnection.getConnection(dbName);
      const listsRepository = connection.getRepository(Lists);

      const list = await listsRepository.findOne({
        where: { id: listId },
        select: ['id', 'templateId', 'version', 'Commodity', 'listName', 'locationClassification'],
      });

      if (!list) {
        this.logger.warn(`List ${listId} not found in database ${dbName}`);
        return null;
      }

      return {
        id: list.id,
        templateId: list.templateId,
        version: list.version,
        commodity: list.Commodity,
        listName: list.listName,
        locationClassification: list.locationClassification,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch list metadata for listId ${listId}:`, error);
      return null;
    }
  }
} 