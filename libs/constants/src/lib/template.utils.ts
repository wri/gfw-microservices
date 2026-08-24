// See apps/webserver/src/client/common/js/utils/templateUtils.js as well
export const deduceActiveName = (activeTemplate) => {
  const templateNameMap = {
    palmMill: 'Palm Oil Mill',
    palmPlantation: 'Palm Oil Plantation',
    palmFarm: 'Palm Smallholder Farm',
    palmGeneric: 'Palm Oil Generic',
    soySilo: 'Soy Silo',
    soyFarm: 'Soy Farm',
    soyGeneric: 'Soy Generic',
    beef: 'Beef Slaughterhouse',
    cattle: 'Cattle Ranch',
    cattleGeneric: 'Cattle Generic',
    cocoa: 'Cocoa Farm',
    cocoaGeneric: 'Cocoa Generic',
    coffee: 'Coffee',
    rubber: 'Rubber',
    pulp: 'Pulp and Paper',
    soy: 'Soy',
    sugarCane: 'Sugar Cane',
    other: 'Other',
  };

  return templateNameMap[activeTemplate] || 'Other';
};

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
