export const GFW_LIST_NAME = {
  adminAreas: 'Administrative Areas',
  oilPalmConcessions: 'Oil Palm Concessions',
  universalMillList: 'Palm Oil Mills',
  protectedAreas: 'Protected Areas',
  rspoConcessions: 'RSPO Palm Concessions',
}

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

export const LIST_STATUS_PENDING = 1; // Entity has been created but not activated.
export const LIST_STATUS_ACTIVE = 2; // Entity that is active
export const LIST_STATUS_INACTIVE = 3; // Entity that is de-activated
export const LIST_STATUS_DRAFT = 4; // Entity that has been edited and is ready for analysis.
export const LIST_STATUS_AANALYZING_DIAGNOSTIC = 5; // Entity that has been triggered for diagnostic analysis; dashboard is ready.
export const LIST_STATUS_ANALYZING_DASHBOARD = 6; // Entity that has been triggered for dashboard analysis; diagnostic is ready.
