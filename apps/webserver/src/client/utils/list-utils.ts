import { MAP_SPAM_COMMODITY } from '../common/js/constants/commodityMap';

export const getCommodityName = (commodity?: string) => {
  if (!commodity) {
    return '';
  }

  if (MAP_SPAM_COMMODITY[commodity]) {
    return MAP_SPAM_COMMODITY[commodity];
  }

  return commodity.startsWith('GFWP_') ? commodity.slice(5).replace(/_/g, ' ') : '';
};
