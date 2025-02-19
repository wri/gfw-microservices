export const COMMODITY_MAP_SPAM = {
  ['arabica coffee']: 'COFF',
  ['cocoa']: 'COCO',
  ['oilpalm']: 'OILP',
  ['robusta coffee']: 'COFF',
  ['rubber']: 'RUBB',
  ['soybean']: 'SOYB',
  ['sugarcane']: 'SUGC',
  ['cocoa farm']: 'COCO',
  ['cocoa generic']: 'COCO',
  ['palm oil plantation']: 'OILP',
  ['palm oil generic']: 'OILP',
  ['palm smallholder farm']: 'OILP',
  ['palm oil mill']: 'OILP',
  ['soy farm']: 'SOYB',
  ['soy generic']: 'SOYB',
  ['sugar cane']: 'SUGC',
};

export const MAPSPAM_COMMODITY = {
  COFF: 'Coffee',
  COCO: 'Cocoa Generic',
  OILP: 'Palm Oil Generic',
  RUBB: 'Rubber',
  SOYB: 'Soy Generic',
  SUGC: 'Sugar Cane',
};

export const REGEX_MAPSPAM_COMMODITY = /^GFWP_(Other|Unknown)$/;
