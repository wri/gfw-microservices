import { Injectable, Logger } from '@nestjs/common';
import { templateColumns } from './constants';
import { ListMetadataService } from './list-metadata.service';

export interface ColumnResolution {
  columns: string[];
  source: 'template' | 'commodity' | 'default';
  resolvedFrom: string;
}

@Injectable()
export class ColumnResolverService {
  private readonly logger = new Logger(ColumnResolverService.name);

  constructor(private readonly listMetadataService: ListMetadataService) {}

  /**
   * Resolves columns for a list based on its metadata
   * @param listId - The list ID
   * @param organizationDatabase - The organization database name
   * @param isGFWList - Whether this is a GFW list
   * @returns Promise<ColumnResolution>
   */
  async resolveColumns(
    listId: number,
    organizationDatabase?: string,
    isGFWList = false
  ): Promise<ColumnResolution> {
    try {
      const metadata = await this.listMetadataService.getListMetadata(
        listId,
        organizationDatabase,
        isGFWList
      );

      if (!metadata) {
        this.logger.warn(`Could not fetch metadata for list ${listId}, using generic fallback`);
      }

      return {
        columns: templateColumns.COMMODITY_GENERIC,
        source: 'default',
        resolvedFrom: 'COMMODITY_GENERIC',
      };
    } catch (error) {
      this.logger.error(`Error resolving columns for list ${listId}:`, error);
      throw error;
    }
  }
}
