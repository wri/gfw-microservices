/**
 * This file has same contents as apps/webserver/src/config/env/gfwLists.constants.js for `GFW_LISTS_NUMBER_CONSTANTS`
 * There's no instance of gfwLists ids being used in the client, but there's a file that contains constants for gfw list names
 * at apps/webserver/src/client/common/js/constants/lists.constants.js with a different approach
 * TODO: check all call sites for gfwlists ids at server level and replace in favor of this file
 */

export const gfwListsIds = {
  ADMINISTRATIVE_AREAS: 1,
  OIL_PALM_CONCESSIONS: 2,
  PALM_OIL_MILLS: 3,
  PROTECTED_AREAS: 4,
  RSPO_PALM_CONCESSIONS: 5,
};

export const gfwListsNames = {
  [gfwListsIds.ADMINISTRATIVE_AREAS]: 'Administrative Areas',
  [gfwListsIds.OIL_PALM_CONCESSIONS]: 'Oil Palm Concessions',
  [gfwListsIds.PALM_OIL_MILLS]: 'Palm Oil Mills',
  [gfwListsIds.PROTECTED_AREAS]: 'Protected Areas',
  [gfwListsIds.RSPO_PALM_CONCESSIONS]: 'RSPO Palm Concessions',
};
