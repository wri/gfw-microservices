/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { COMMODITY_MAP_SPAM } from '@wri-monorepos/constants';

export class ConvertCommodityToMapSpamCode extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ConvertCommodityToMapSpamCode.name);

  async handle(request: ChainType): Promise<ChainType> {
    this.logger.log('Converting commodity name to MAPSPAM code');
    const { commodity } = request.request as RequestNewList;

    const commodityDB = this.getCommodityDB(commodity);

    return {
      ...request,
      request: {
        ...request.request,
        commodity: commodityDB,
      },
    };
  }

  private getCommodityDB(commodity: string) {
    const commoditySpamName = ConvertCommodityToMapSpamCode.getCommoditySpamName(commodity);
    if (commoditySpamName) {
      return commoditySpamName;
    }
    if (commodity.startsWith('GFWP_')) {
      return commodity;
    }

    return `GFWP_${commodity.replace(/\s+/g, '_')}`;
  }

  static getCommoditySpamName(commodity: string): string | undefined {
    if (Object.values(COMMODITY_MAP_SPAM).includes(commodity)) {
      return commodity;
    }

    const formattedCommodity = commodity.trim().toLocaleLowerCase();

    return COMMODITY_MAP_SPAM[formattedCommodity];
  }
}
