/**
 * Duplicate contents from
 * {@link libs/constants/src/lib/commodityMapSpam.ts}
 *
 * @summary libs/constants is not buildable and libs/sql complaints about
 * not finding the contents of the filepath above
 *
 * duplicated items:
 * - COMMODITY_MAP_SPAM
 * - MAPSPAM_COMMODITY
 */
export const GHG_PREFIX = 'GFWP';

export enum MAPSPAM_CODES {
  COCO = 'COCO',
  COFF = 'COFF',
  OILP = 'OILP',
  RUBB = 'RUBB',
  SOYB = 'SOYB',
  SUGC = 'SUGC',
}

export const COMMODITY_MAP_SPAM = {
  ['arabic coffee']: MAPSPAM_CODES.COFF,
  ['coffee']: MAPSPAM_CODES.COFF,
  ['cocoa']: MAPSPAM_CODES.COCO,
  ['cocoa farm']: MAPSPAM_CODES.COCO,
  ['cocoa generic']: MAPSPAM_CODES.COCO,
  ['oilpalm']: MAPSPAM_CODES.OILP,
  ['palm oil']: MAPSPAM_CODES.OILP,
  ['palm oil plantation']: MAPSPAM_CODES.OILP,
  ['palm oil generic']: MAPSPAM_CODES.OILP,
  ['palm smallholder farm']: MAPSPAM_CODES.OILP,
  ['palm oil mill']: MAPSPAM_CODES.OILP,
  ['rubber']: MAPSPAM_CODES.RUBB,
  ['soybean']: MAPSPAM_CODES.SOYB,
  ['sugarcane']: MAPSPAM_CODES.SUGC,
  ['sugar cane']: MAPSPAM_CODES.SUGC,
  ['soy']: MAPSPAM_CODES.SOYB,
  ['soy silo']: MAPSPAM_CODES.SOYB,
  ['soy farm']: MAPSPAM_CODES.SOYB,
  ['soy generic']: MAPSPAM_CODES.SOYB,
};

export const MAPSPAM_COMMODITY = {
  [MAPSPAM_CODES.COFF]: 'Coffee',
  [MAPSPAM_CODES.COCO]: 'Cocoa',
  [MAPSPAM_CODES.OILP]: 'Palm Oil',
  [MAPSPAM_CODES.RUBB]: 'Rubber',
  [MAPSPAM_CODES.SOYB]: 'Soy',
  [MAPSPAM_CODES.SUGC]: 'Sugar Cane',
};
