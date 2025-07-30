export const deduceActiveId = (activeTemplate) => {
  const templateMap = {
    investment: 1,
    palmMill: 2,
    palmPlantation: 3,
    palmFarm: 4,
    palmGeneric: 5,
    soySilo: 6,
    soyFarm: 7,
    soyGeneric: 8,
    beef: 9,
    cattle: 10,
    cattleGeneric: 11,
    cocoa: 12,
    cocoaGeneric: 13,
    other: 14,
    generic: 14,
  };

  return templateMap[activeTemplate] || 1;
};

export const templateList = {
  1: 'Investment',
  2: 'Palm Oil Mill',
  3: 'Palm Oil Plantation',
  4: 'Palm Smallholder Farm',
  5: 'Palm Oil Generic',
  6: 'Soy Silo',
  7: 'Soy Farm',
  8: 'Soy Generic',
  9: 'Beef Slaughterhouse',
  10: 'Cattle Ranch',
  11: 'Cattle Generic',
  12: 'Cocoa Farm',
  13: 'Cocoa Generic',
  14: 'Other',
};
