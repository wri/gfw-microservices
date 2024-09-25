import { proLayers } from '../proLayers.config';

const {
  administrativeAreas,
  oilPalmConcessions,
  protectedAreas,
  rspoConcessions,
  universalMillList,
} = proLayers;

const GFW_LISTS_NAMES_TO_MAP_LAYER_IDS = {
  'Administrative Areas': administrativeAreas,
  'Oil Palm Concessions': oilPalmConcessions,
  'Palm Oil Mills': universalMillList,
  'Protected Areas': protectedAreas,
  'RSPO Palm Concessions': rspoConcessions,
};

export const ADMINISTRATIVE_AREAS_LIST_INDEX = 0;
export const PALM_OIL_MILLS_LIST_INDEX = 2;
export const PROTECTED_AREAS_LIST_INDEX = 3;

export const MAP_LAYER_IDS_TO_GFW_LISTS_NAMES = Object.fromEntries(
  Object.entries(GFW_LISTS_NAMES_TO_MAP_LAYER_IDS).map(([name, id]) => [id, name])
);

export const gfwListNames = Object.keys(GFW_LISTS_NAMES_TO_MAP_LAYER_IDS);

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
