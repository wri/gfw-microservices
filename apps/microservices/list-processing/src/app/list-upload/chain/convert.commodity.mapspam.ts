import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { COMMODITY_MAP_SPAM } from '@wri-monorepos/constants';
export class ConvertCommodityToMapsPamCode extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertCommodityToMapsPamCode.name);

  async handle(request: ChainType): Promise<ChainType> {
    const { commodity } = request.request as RequestNewList;
    if (commodity === 'Other') {
      return {
        ...request,
        request: {
          ...request.request,
          commodity: 'Other',
        },
      };
    }
    if (Object.values(COMMODITY_MAP_SPAM).includes(commodity)) {
      return {
        ...request,
        request: {
          ...request.request,
          commodity,
        },
      };
    }
    const commodityMapSpam = COMMODITY_MAP_SPAM[commodity.toLocaleLowerCase().trim()];
    if (!commodityMapSpam) {
      return {
        ...request,
        request: {
          ...request.request,
          commodity: `"GFWP_"${commodity.replace(/ /g, '_')}`,
        },
      };
    }
    return {
      ...request,
      request: {
        ...request.request,
        commodity: commodityMapSpam,
      },
    };
  }
}
