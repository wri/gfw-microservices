import difference from 'lodash/difference';
import intersection from 'lodash/intersection';
import { gfwListsLocationID } from '../../../listDetails/js/components/lists/Lists.config';
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

const PALM_OIL_MILLS = 'Palm Oil Mills';

const checkColumnListDraftList = (accessor) => {
  return (
    accessor === 'Analysis Area' ||
    accessor === 'state' ||
    accessor === 'State' ||
    accessor === 'subState'
  );
};

const isHiddenColumnInPost2020riskTable = (accessor) => {
  const post2020riskassessmentHiddenDataColumns = [
    'Certification',
    'End Date',
    'Latitude',
    'Longitude',
    'Refinery Name',
    'Start Date',
    'Time Horizon',
    'Volume',
    'coverageHA',
    'gadmId',
    'jrcForestLossByYear',
    'jrcLandAreaHA',
    'jrcNaturalForestLossHA',
    'jrcNaturalForestLossPercent',
    'landmarkHA',
    'landmarkPercent',
    'listId',
    'listName',
    'list_id',
    'locationError',
    'locationId',
    'locationName',
    'location_id',
    'naturalForestLossByYear',
    'naturalForestLossHA',
    'naturalForestLossPercent',
    'negligibleRisk',
    'protectedAreasHA',
    'protectedAreasPercent',
    'statusCode',
    'totalAreaHa',
    'totalRows',
  ];
  return post2020riskassessmentHiddenDataColumns.includes(accessor);
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
  if (list_name === PALM_OIL_MILLS) {
    return (
      checkColumnListFC(accessor) ||
      accessor === 'Parent Company' ||
      accessor === 'Certification' ||
      accessor === 'RSPO Model' ||
      accessor === 'Mill ID' ||
      accessor === 'Alternative Name' ||
      accessor === 'id' ||
      accessor === 'globalid' ||
      accessor === 'Geometry' ||
      accessor === 'Geometry Simplified'
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
  if (list_name === PALM_OIL_MILLS) {
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
  if (!list_name) {
    return false;
  }
  return list_name.search(/[^A-Za-z0-9\s]/) > -1;
};

/**
 * Get lists of Filtered locations based on filter search term
 * @param {Object} filteredLocationData - List locations
 * @param {Object} combinedColumns - List columns
 * @param {String} listFilterStr - List filter string
 * @returns {Array} - Filter results
 */
export const getListFilteredLocations = (
  filteredLocationData,
  combinedColumns,
  listFilterStr = ''
) => {
  const activeColumns = combinedColumns.filter(
    (v) => v.show && v.accessor !== 'checkbox' && !v.accessor.includes('flag_')
  );

  return filteredLocationData.filter((e) =>
    activeColumns.some((col) => {
      let cellValue = '';
      if (typeof col.accessor === 'function') {
        cellValue = col.accessor(e);
      } else if (typeof col.accessor === 'string') {
        cellValue = e[col.accessor];
      }
      return (cellValue ?? '').toString().toLowerCase().includes(listFilterStr.toLowerCase());
    })
  );
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
    case PALM_OIL_MILLS:
      id = location[gfwListsLocationID[gfwList].location_field];
      break;
    default:
      id = location[gfwListsLocationID[gfwList].location_field];
  }

  return id;
};

/**
 * Find if list is excluded list based on list `id or associated_gfwlist` number
 * @param {Object} selectedList - Selected List
 * @return {boolean} - [ true/false ] value in case that list is excluded GFW list or not
 */
export const isDownloadDisabledForThisList = (selectedList) => {
  const {
    associated_gfwlist: associatedGfwlist,
    isGlobalForestWatchList,
    list_name: ListName,
  } = selectedList;

  if (associatedGfwlist) {
    return GFW_LISTS_WITH_DOWNLOAD_OPTION_DISABLED.includes(associatedGfwlist);
  }

  if (isGlobalForestWatchList) {
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
export const getListValidStatus = (list_status_id) => {
  return list_status_id === listStatus.Active || list_status_id === listStatus.Draft;
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

export function getFilterCounter(filterValues) {
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

const isListFailedByAnalysisStatusLimit = ({ listAnalysesStatus }) => {
  return listAnalysesStatus.some(({ status, errorInfo }) => {
    return status === listStatus.Inactive && errorInfo === 'Exceeded Analysis Limit';
  });
};

module.exports = {
  checkColumnListDraftList,
  isHiddenColumnInPost2020riskTable,
  checkColumnListFC,
  checkColumnListCR,
  checkColumnListPA,
  checkColumnListGFWFC,
  checkColumnListGFWCR,
  containsPunctuation,
  getListFilteredLocations,
  compareSelectedAndVisibleLocations,
  getGFWListLocationIDs,
  isDownloadDisabledForThisList,
  removeReturnCharacters,
  dataCleanup,
  getListValidStatus,
  getListStatusId,
  getFilterCounter,
  findArrIndex,
  isAnalyzingStatus,
  isFailedList,
  isListFailedByAnalysisStatusLimit,
};
