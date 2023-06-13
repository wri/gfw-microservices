export const GFW_LIST_NAME = {
  adminAreas: 'Administrative Areas',
  oilPalmConcessions: 'Oil Palm Concessions',
  universalMillList: 'Palm Oil Mills',
  protectedAreas: 'Protected Areas',
  rspoConcessions: 'RSPO Palm Concessions',
};

export const gfwListNames = Object.values(GFW_LIST_NAME);

export const GFW_LISTS_WITH_DOWNLOAD_OPTION_DISABLED = [4, 5]; // 'Protected Areas' and 'Administrative Areas'
export const GFW_LISTS_NAMES_WITH_DOWNLOAD_OPTION_DISABLED = [...gfwListNames];

export const filterKeys = [
  'selectedCountry',
  'selectedState',
  'selectedSubState',
  'selectedAreaMin',
  'selectedAreaMax',
  'showTreeCoverExtent',
  'showTreeCoverLoss',
  'showTreeCoverLossPrimaryForest',
  'showTreeCoverLossProtectedAreas',
];

export const EXCLUDED_COLUMNS = ['Latitude', 'Longitude'];

export const defaultMaximumAreaSizeForLocationsFilter = 1000000;
