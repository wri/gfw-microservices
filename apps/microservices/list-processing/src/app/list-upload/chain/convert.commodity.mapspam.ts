import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { COMMODITY_MAP_SPAM } from '@wri-monorepos/constants';

export class ConvertCommodityToMapsPamCode extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertCommodityToMapsPamCode.name);

  async handle(request: ChainType): Promise<ChainType> {
    this.logger.log('Converting commodity name to MAPSPAM code');
    const { commodity } = request.request as RequestNewList;
    let commodityName = 'Unknown';
    if (commodity === 'Other') {
      commodityName = 'Other';
    } else if (commodity === 'Unknown') {
      commodityName = 'Unknown';
    } else if (Object.values(COMMODITY_MAP_SPAM).includes(commodity)) {
      commodityName = commodity;
    } else {
      const commodityMapSpam = COMMODITY_MAP_SPAM[commodity.toLocaleLowerCase().trim()];
      if (!commodityMapSpam) {
        commodityName = `GFWP_${commodity.replace(/ /g, '_')}`;
      } else {
        commodityName = commodityMapSpam;
      }
    }

    return {
      ...request,
      request: {
        ...request.request,
        commodity: commodityName,
      },
    };
  }
}
