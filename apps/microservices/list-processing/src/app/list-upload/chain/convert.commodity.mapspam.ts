import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { COMMODITY_MAP_SPAM } from '@wri-monorepos/constants';

export class ConvertCommodityToMapsPamCode extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertCommodityToMapsPamCode.name);

  async handle(request: ChainType): Promise<ChainType> {
    this.logger.log('Converting commodity name to MAPSPAM code');
    const { commodity } = request.request as RequestNewList;

    const commodityName = this.getCommodityName(commodity);

    return {
      ...request,
      request: {
        ...request.request,
        commodity: commodityName,
      },
    };
  }

  private getCommodityName(commodity: string): string {
    if (Object.values(COMMODITY_MAP_SPAM).includes(commodity)) {
      return commodity;
    }

    const commodityMapSpam = COMMODITY_MAP_SPAM[commodity.toLocaleLowerCase().trim()];
    return commodityMapSpam ? commodityMapSpam : `GFWP_${commodity.replace(/ /g, '_')}`;
  }
}
