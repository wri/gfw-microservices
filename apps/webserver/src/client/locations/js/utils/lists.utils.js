/* eslint-disable import/no-import-module-exports */
import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import { proLayers } from '../../../common/js/config';
import { gfwListsLocationID } from '../components/lists/Lists.config';
import { GFWLists } from '../config/listNames';
import { getListStatusIdByStatusName } from './draft.utils';
import {
  FILTER_STRING_VARIABLES,
  FILTER_ARRAY_VARIABLES,
  FILTER_BOOLEAN_VARIABLES,
} from '../constants/components';
import {
  GFW_LISTS_WITH_DOWNLOAD_OPTION_DISABLED,
  GFW_LISTS_NAMES_WITH_DOWNLOAD_OPTION_DISABLED,
} from '../../../common/js/constants/lists.constants';
import { listStatus } from '../../../../config/env/listStatuses.constants';

const {
  administrativeAreas,
  oilPalmConcessions,
  protectedAreas,
  rspoConcessions,
  universalMillList,
} = proLayers;

// Check to see which views should be enabled
const checkValidView = (listData) => {
  return listData.length !== 0;
};

// Check to see which views should be enabled
const checkValidViewCommodity = (selectedLists, listData) => {
  if (selectedLists.length > 0 && listData.length > 0) {
    if (selectedLists[0].hasOwnProperty('user_id')) {
      // This is a user list
      const { template_id } = selectedLists[0];
      const location = listData[0];
      const locationClassification = location['Location Classification']
        ? location['Location Classification'].toLowerCase()
        : null;
      return template_id === 2 || (template_id === 5 && locationClassification === 'supply shed');
    }
    // This is a GFW list
    return selectedLists[0].list_name === 'Palm Oil Mills';
  }
  return false;
};

const checkColumnListFC = (accessor) => {
  return (
    accessor === 'Analysis Area' ||
    accessor === 'Analysis Radius' ||
    accessor === 'State' ||
    accessor === 'Commodity' ||
    accessor === 'total_area' ||
    accessor === 'Accuracy Rating of Location Entered' ||
    accessor === 'Wind Barrier' ||
    accessor === 'Riparian Buffers' ||
    accessor === 'Buffer Zones' ||
    // accessor === 'Size of Investment' ||
    accessor === 'gadmid'
  );
};

const classNameForListStatus = (listStatus) => {
  switch (listStatus) {
    case 1: // Pending
      return 'locations-list--inactive';
    case 3: // Inactive
      return 'locations-list--failed';
    default:
      return '';
  }
};

const discernGfwID = (gfwListName) => {
  let gfwLayerId;
  switch (gfwListName) {
    case 'RSPO Palm Concessions':
      gfwLayerId = rspoConcessions;
      break;
    case 'Protected Areas':
      gfwLayerId = protectedAreas;
      break;
    case 'Oil Palm Concessions':
      gfwLayerId = oilPalmConcessions;
      break;
    case 'Palm Oil Mills':
      gfwLayerId = universalMillList;
      break;
    case 'Administrative Areas':
      gfwLayerId = administrativeAreas;
      break;
    default:
      gfwLayerId = false;
  }
  return gfwLayerId;
};

const checkColumnListCR = (accessor) => {
  return (
    accessor === 'total_area' ||
    accessor === 'Wind Barrier' ||
    accessor === 'Riparian Buffers' ||
    accessor === 'Buffer Zones' ||
    accessor === 'gadmid' ||
    accessor === 'Accuracy Rating of Location Entered' ||
    accessor === 'Analysis Area' ||
    accessor === 'Analysis Radius'
  );
};

const checkColumnListGFWFC = (list_name, accessor) => {
  if (list_name === 'Palm Oil Mills') {
    return (
      checkColumnListFC(accessor) ||
      accessor === 'Parent Company' ||
      accessor === 'Certification' ||
      accessor === 'RSPO Model' ||
      accessor === 'Mill ID' ||
      accessor === 'Alternative Name' ||
      accessor === 'id' ||
      accessor === 'globalid'
    );
  }
  if (list_name === 'RSPO Palm Concessions' || list_name === 'Oil Palm Concessions') {
    return (
      checkColumnListFC(accessor) ||
      accessor === 'Company' ||
      accessor === 'Parent Company' ||
      accessor === 'Certification' ||
      accessor === 'id' ||
      accessor === 'globalid'
    );
  }
  return checkColumnListFC(accessor) || accessor === 'id' || accessor === 'globalid';
};

const checkColumnListPA = (list_name, accessor) => {
  if (list_name === 'Protected Areas') {
    return (
      checkColumnListCR(accessor) ||
      accessor === 'Designation' ||
      accessor === 'Designation Type' ||
      accessor === 'IUCN CAT' ||
      accessor === 'id' ||
      accessor === 'globalid'
    );
  }
  return false;
};

const checkColumnListGFWCR = (list_name, accessor) => {
  if (list_name === 'Palm Oil Mills') {
    return (
      checkColumnListCR(accessor) ||
      accessor === 'RSPO Model' ||
      accessor === 'Mill ID' ||
      accessor === 'Alternative Name' ||
      accessor === 'id' ||
      accessor === 'globalid'
    );
  }
  return false;
};

const containsPunctuation = (list_name) => {
  return list_name.search(/[^A-Za-z0-9\s]/) > -1;
};

/**
 * Get lists of Filtered locations based on filter search term
 * @param {Object} filteredLocationData - List locations
 * @param {Object} combinedColumns - List columns
 * @param {String} listFilterStr - List filter string
 * @returns {Array} - Filter results
 */
export const getListFilteredLocations = (filteredLocationData, combinedColumns, listFilterStr) => {
  const activeColumns = combinedColumns.filter(
    (v) => v.show && v.accessor !== 'checkbox' && v.accessor !== 'flags'
  );
  return filteredLocationData.filter((e) => {
    return (
      activeColumns
        .map((col) => {
          const cellValue =
            typeof col.accessor === 'function'
              ? col.accessor(e)
              : typeof col.accessor === 'string'
              ? e[col.accessor]
              : undefined;
          return (
            cellValue &&
            cellValue.toString().toLowerCase().includes(listFilterStr.toString().toLowerCase())
          );
        })
        .filter((v) => v).length > 0
    );
  });
};

/**
 * Compare selected locations with filtered locations and update REDUX state accordingly
 * @param {Array} selectedLocations - Selected location IDs
 * @param {Array} listFilteredLocations - Filtered Locations
 * @return {Array} selectedAndVisibleLocations - List of Selected and Visible Locations
 */
const compareSelectedAndVisibleLocations = (selectedLocations, listFilteredLocations) => {
  const listFilteredLocationIDs = listFilteredLocations.map((item) => item.location_id);
  const selectedLocationsDifference = difference(selectedLocations, listFilteredLocationIDs);

  if (selectedLocationsDifference.length > 0 && selectedLocations.length > 0) {
    return intersection(selectedLocations, listFilteredLocationIDs);
  }
  if (selectedLocations.length > 0) {
    return selectedLocations;
  }
  return [];
};

/**
 * Get ID from GFW List based on GFW List name
 * @param {string} gfwList - GFW List name
 * @param location - Location form GFW List
 * @returns {{gadmid: *, serverLayerId: (string)}|number}
 */
const getGFWListLocationIDs = (gfwList, location) => {
  let id;

  switch (gfwList) {
    case 'Administrative Areas':
      id = {
        gadmid: location.gadmid,
        serverLayerId: location['Sub State'] ? '4' : location.State ? '5' : '6',
      };
      break;
    case 'Palm Oil Mills':
      id = location[gfwListsLocationID[gfwList].location_field];
      break;
    default:
      id = location[gfwListsLocationID[gfwList].location_field];
  }

  return id;
};

/**
 * Get check and return GFW Lists Name or `FALSE` in case that list is not GFW List
 * @param {String} selectedLists - Selected list name
 * @returns {string|boolean}
 */
const getGfwListName = (selectedLists) => {
  const listName = selectedLists[0].list_name;
  return selectedLists.length > 0 && GFWLists.indexOf(listName) > -1 ? listName : false;
};

/**
 * Find if list is excluded list based on list `id or associated_gfwlist` number
 * @param {Object} selectedList - Selected List
 * @return {boolean} - [ true/false ] value in case that list is excluded GFW list or not
 */
const isDownloadDisabledForThisList = (selectedList) => {
  const {
    associated_gfwlist: associatedGfwlist,
    globalForestWatchList,
    list_name: ListName,
  } = selectedList;

  if (associatedGfwlist) {
    return GFW_LISTS_WITH_DOWNLOAD_OPTION_DISABLED.includes(associatedGfwlist);
  }

  if (globalForestWatchList) {
    return GFW_LISTS_NAMES_WITH_DOWNLOAD_OPTION_DISABLED.includes(ListName);
  }

  return false;
};

/**
 * Removing return/new line characters from string
 * @param {*} value - Value
 * @return {*}
 */
const removeReturnCharacters = (value) => {
  return typeof value === 'string' && value.length > 0
    ? value.replace(/(\r\n|\n|\r)/gm, '')
    : value;
};

/**
 * Cleaning CSV cell values from columnRow
 * @param {Array} data - Column cells
 * @return {Array}
 */
const dataCleanup = (data) => {
  const keys = Object.keys(data[0]);
  const cleanData = data.map((item) => {
    const cleanItem = {};
    keys.forEach((key) => {
      cleanItem[key] = removeReturnCharacters(item[key]);
    });
    return cleanItem;
  });
  return cleanData;
};

/**
 * Get valid List Status
 *
 * @param {number} list_status_id - List status ID
 * @return {boolean} - Return true/false value for template validity
 */
const getListValidStatus = (list_status_id) => {
  return list_status_id === 2 || list_status_id === getListStatusIdByStatusName('Draft');
};

/**
 * Get List Status ID
 *
 * @param {boolean} isSaveAsDraft - Is save as Draft (true/false)
 * @return {number} - List status ID (eg. Pending = 1 || Draft = 4)
 */
export function getListStatusId(isSaveAsDraft) {
  return isSaveAsDraft ? listStatus.Draft : listStatus.Pending;
}

/**
 * Get Template Data
 *
 * @param {Array} allTemplatesData - All Templates Data
 * @param {Object} selectedList - Selected List data
 * @return {Object} - Template data for selected list
 */
function getTemplateData(allTemplatesData, selectedList) {
  return allTemplatesData.find((v) => {
    return v.template_id === selectedList.template_id;
  });
}

function getFilterCounter(filterValues) {
  let counter = 0;
  Object.keys(filterValues).forEach((key) => {
    if (FILTER_STRING_VARIABLES.includes(key) && filterValues[key] !== '') {
      counter++;
    } else if (FILTER_ARRAY_VARIABLES.includes(key) && filterValues[key].length > 0) {
      counter++;
    } else if (FILTER_BOOLEAN_VARIABLES.includes(key) && filterValues[key]) {
      counter++;
    }
  });
  return counter;
}

const findArrIndex = (arr, itemProp, value, itemPropTwo, valueTwo) => {
  let index = -1;

  arr.forEach((item, i) => {
    if (item && item[itemProp] === value) {
      if (itemPropTwo && valueTwo) {
        if (item[itemPropTwo] === valueTwo) {
          index = i;
        }
      } else {
        index = i;
      }
    }
  });

  return index;
};

const isAnalyzingStatus = (status) => {
  return [
    listStatus.Pending,
    listStatus.AnalyzingDiagnostic,
    listStatus.AnalyzingDiagnostic,
  ].includes(status);
};

const isFailedList = (list) => list?.list_status_id === listStatus.Inactive;

const isLocationDataNotAvailable = (list) => {
  const isFailed = isFailedList(list);
  const isBeingAnalized = isAnalyzingStatus(list.list_status_id);
  const hasLockStatus = !!list.lock_status && !!list.lock_user_id;
  return isFailed || isBeingAnalized || hasLockStatus;
};

const isListFailedByAnalysisStatusLimit = (list) => {
  if (list.AnalysisID) {
    for (const analysisIDKey in list.AnalysisID) {
      const analysis = list.AnalysisID[analysisIDKey];
      if (analysis.Status === listStatus.Inactive && analysis.ErrorInfo === 'Exceeded Analysis Limit') {
        return true; // Return true as soon as a matching item is found
      }
    }
  }
  return false;
};

module.exports = {
  checkValidView,
  checkValidViewCommodity,
  checkColumnListFC,
  checkColumnListCR,
  checkColumnListPA,
  checkColumnListGFWFC,
  checkColumnListGFWCR,
  classNameForListStatus,
  containsPunctuation,
  discernGfwID,
  getListFilteredLocations,
  compareSelectedAndVisibleLocations,
  getGFWListLocationIDs,
  getGfwListName,
  isDownloadDisabledForThisList,
  removeReturnCharacters,
  dataCleanup,
  getListValidStatus,
  getListStatusId,
  getTemplateData,
  getFilterCounter,
  findArrIndex,
  isAnalyzingStatus,
  isFailedList,
  isLocationDataNotAvailable,
  isListFailedByAnalysisStatusLimit,
};
