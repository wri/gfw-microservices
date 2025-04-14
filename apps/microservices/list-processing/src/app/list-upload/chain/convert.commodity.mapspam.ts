import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { COMMODITY_MAP_SPAM } from '@wri-monorepos/constants';

export class ConvertCommodityToMapsPamCode extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertCommodityToMapsPamCode.name);

  async handle(request: ChainType): Promise<ChainType> {
    this.logger.log('Converting commodity name to MAPSPAM code');
    const { commodity } = request.request as RequestNewList;

    const commodityName = this.convertCommodityNameToSave(commodity);

    return {
      ...request,
      request: {
        ...request.request,
        commodity: commodityName,
      },
    };
  }

  private convertCommodityNameToSave(commodity: string) {
    const commodityName = ConvertCommodityToMapsPamCode.getCommodityName(commodity);

    return commodityName || `GFWP_${commodity.replace(/\s+/g, '_')}`;
  }

  static getCommodityName(commodity: string): string | undefined {
    if (Object.values(COMMODITY_MAP_SPAM).includes(commodity)) {
      return commodity;
    }

    const formattedCommodity = commodity.trim().toLocaleLowerCase();

    return COMMODITY_MAP_SPAM[formattedCommodity];
  }
}
