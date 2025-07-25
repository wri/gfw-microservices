import { Injectable, Logger } from '@nestjs/common';
import { templateColumns } from './constants';
import { ListMetadata, ListMetadataService } from './list-metadata.service';

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
        return this.getDefaultColumns();
      }

      // Use commodity-based resolution for all lists
      return this.resolveFromCommodity(metadata);
    } catch (error) {
      this.logger.error(`Error resolving columns for list ${listId}:`, error);
      return this.getDefaultColumns();
    }
  }

  /**
   * Resolves columns from commodity (version 2 approach)
   */
  private resolveFromCommodity(metadata: ListMetadata): ColumnResolution {
    if (!metadata.commodity) {
      this.logger.warn(`List ${metadata.id} has version ${metadata.version} but no commodity`);
      return {
        columns: templateColumns.COMMODITY_GENERIC,
        source: 'default',
        resolvedFrom: 'COMMODITY_GENERIC (no commodity specified)',
      };
    }

    // Map commodity to appropriate column set
    const commodityColumns = this.getCommodityColumns(metadata.commodity);

    return {
      columns: commodityColumns.columns,
      source: 'commodity',
      resolvedFrom: `commodity: ${metadata.commodity} -> ${commodityColumns.resolvedFrom}`,
    };
  }

  /**
   * Returns default columns when metadata is unavailable
   */
  private getDefaultColumns(): ColumnResolution {
    return {
      columns: templateColumns.COMMODITY_GENERIC,
      source: 'default',
      resolvedFrom: 'COMMODITY_GENERIC (default fallback)',
    };
  }

  /**
   * Maps commodity codes to column sets
   */
  private getCommodityColumns(commodity: string): { columns: string[]; resolvedFrom: string } {
    // Handle GFWP prefixed commodities
    if (commodity.startsWith('GFWP_')) {
      const baseCommodity = commodity.replace('GFWP_', '');
      return this.mapCommodityToColumns(baseCommodity, commodity);
    }

    return this.mapCommodityToColumns(commodity, commodity);
  }

  /**
   * Maps a commodity name to appropriate column template
   */
  private mapCommodityToColumns(
    commodity: string,
    originalCommodity: string
  ): { columns: string[]; resolvedFrom: string } {
    const lowerCommodity = commodity.toLowerCase();

    // Map common commodities to template columns
    if (lowerCommodity.includes('palm') || lowerCommodity.includes('oil')) {
      return {
        columns: templateColumns.PALM_OIL_GENERIC,
        resolvedFrom: `${originalCommodity} -> PALM_OIL_GENERIC`,
      };
    }

    if (lowerCommodity.includes('soy')) {
      return {
        columns: templateColumns.SOY_GENERIC,
        resolvedFrom: `${originalCommodity} -> SOY_GENERIC`,
      };
    }

    if (lowerCommodity.includes('cocoa') || lowerCommodity.includes('coco')) {
      return {
        columns: templateColumns.COCOA_GENERIC,
        resolvedFrom: `${originalCommodity} -> COCOA_GENERIC`,
      };
    }

    if (lowerCommodity.includes('cattle') || lowerCommodity.includes('beef')) {
      return {
        columns: templateColumns.CATTLE_GENERIC,
        resolvedFrom: `${originalCommodity} -> CATTLE_GENERIC`,
      };
    }

    if (lowerCommodity.includes('investment') || lowerCommodity.includes('multiple')) {
      return {
        columns: templateColumns.INVESTMENT,
        resolvedFrom: `${originalCommodity} -> INVESTMENT`,
      };
    }

    // Default to generic commodity columns
    return {
      columns: templateColumns.COMMODITY_GENERIC,
      resolvedFrom: `${originalCommodity} -> COMMODITY_GENERIC (default)`,
    };
  }
}
