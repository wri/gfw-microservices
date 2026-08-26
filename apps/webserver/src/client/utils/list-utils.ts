import { MAP_SPAM_COMMODITY } from '../common/js/constants/commodity-map.constants';

export const getCommodityName = (commodity?: string) => {
  if (!commodity) {
    return '';
  }

  if (MAP_SPAM_COMMODITY[commodity]) {
    return MAP_SPAM_COMMODITY[commodity];
  }

  if (commodity.toLowerCase() === 'multiple') {
    return 'Multiple Commodities';
  }

  return commodity.startsWith('GFWP_') ? commodity.slice(5).replace(/_/g, ' ') : '';
};
