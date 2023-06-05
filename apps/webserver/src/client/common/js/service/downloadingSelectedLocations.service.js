import axios from 'axios';
import moment from 'moment/moment';
import { saveAs } from 'file-saver';

const EXCLUDED_COLUMNS = ['gadmid', 'checkbox', 'tree_cover_extent_total'];

/**
 * @description - Get the data to filter a selected list.
 * @param {[]} [tableColumns] - Table columns (e.g. ['checkbox', 'Latitude', 'Longitude'])
 * @return {string} - Filtered columns (e.g. 'Latitude,Longitude')
 */
export function getListColumnsNames(tableColumns) {
  const columnsList = tableColumns
    .filter((tableColumn) => {
      // eslint-disable-next-line valid-typeof
      if (typeof tableColumn.accessor === 'string') {
        return !EXCLUDED_COLUMNS.includes(tableColumn.accessor);
      }

      return typeof tableColumn.accessor === 'string' && !EXCLUDED_COLUMNS.includes(tableColumn.id);
    })
    .map((tableColumn) => {
      return tableColumn.id || tableColumn.accessor;
    });

  return columnsList.toString();
}

/**
 * @description - Download selected locations
 * @param {number} listID - Selected list ID (e.g. 2073)
 * @param {string} [sortByAttribute] - Sort by attribute (e.g. 'State')
 * @param {string} [orderType] - Order type (e.g. 'asc' or 'desc')
 * @param {string} [selectedCountry] - Country (e.g. 'Brazil')
 * @param {string} [selectedState] - State (e.g. 'Bahia')
 * @param {string} [selectedSubState] - Sub state (e.g. 'Barreiras')
 * @param {number} [selectedAreaMax] - Analysis area max (e.g. 0)
 * @param {number} [selectedAreaMin] - Analysis area min (e.g. 20)
 * @param {string[]} [tableColumns] - Table columns (e.g. ['Latitude', 'Longitude', ...])
 * @param {number[]} [selectedLocations] - Selected locations (e.g. [1, 2, 3, ...])
 */
export function downloadingSelectedLocations(
  listID,
  listName,
  {
    orderType,
    sortByAttribute,
    selectedCountry,
    selectedState,
    selectedSubState,
    selectedAreaMax,
    selectedAreaMin,
    columnsToReturn,
    selectedLocations,
  }
) {
  const params = {
    listID,
    sortByAttribute,
    orderType,
    country: selectedCountry,
    state: selectedState,
    subState: selectedSubState,
    analysisAreaMax: selectedAreaMax,
    analysisAreaMin: selectedAreaMin,
    columnsToReturn,
    selectedLocationIDs: selectedLocations,
  };

  return axios({
    url: '/locations/downloadingSelectedLocations',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data: params,
  })
    .then((response) => {
      const isoDateString = moment().toISOString();
      const currentDate = moment(isoDateString).format('YYYYMMDD_HHmmss');
      const fileName = `${listName}_${currentDate}.csv`;

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      saveAs(blob, fileName);
    })
    .catch((err) => {
      console.error(err);
    });
}

/**
 * @description - Download selected locations
 * @param {number} listID - Selected list ID (e.g. 2073)
 * @param {string} [sortByAttribute] - Sort by attribute (e.g. 'State')
 * @param {string} [orderType] - Order type (e.g. 'asc' or 'desc')
 * @param {string} [selectedCountry] - Country (e.g. 'Brazil')
 * @param {string} [selectedState] - State (e.g. 'Bahia')
 * @param {string} [selectedSubState] - Sub state (e.g. 'Barreiras')
 * @param {number} [selectedAreaMax] - Analysis area max (e.g. 0)
 * @param {number} [selectedAreaMin] - Analysis area min (e.g. 20)
 * @param {string[]} [tableColumns] - Table columns (e.g. ['Latitude', 'Longitude', ...])
 * @param {number[]} [selectedLocations] - Selected locations (e.g. [1, 2, 3, ...])
 */
export function downloadingSelectedLocationsJson(
  listID,
  {
    orderType,
    sortByAttribute,
    selectedCountry,
    selectedState,
    selectedSubState,
    selectedAreaMax,
    selectedAreaMin,
    columnsToReturn,
    selectedLocations,
  }
) {
  const params = {
    listID,
    sortByAttribute,
    orderType,
    country: selectedCountry,
    state: selectedState,
    subState: selectedSubState,
    analysisAreaMax: selectedAreaMax,
    analysisAreaMin: selectedAreaMin,
    columnsToReturn,
    selectedLocationIDs: selectedLocations,
  };

  return axios({
    url: '/locations/downloadingSelectedLocations/json',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data: params,
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.error(err);
    });
}
