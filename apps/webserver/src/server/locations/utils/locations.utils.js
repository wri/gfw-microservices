/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-promise-reject-errors */

const path = require('path');
const sql = require('mssql');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));

/**
 * @description - function that uses a procedure to return the values to populate
 * the filters of specific list.
 * */
const addCountry = (item, listRecord) => {
  const localListRecord = { ...listRecord };
  if (!Object.prototype.hasOwnProperty.call(localListRecord, item.Country)) {
    localListRecord[item.Country] = {};
  }
  return localListRecord;
};

const addState = (item, listRecord) => {
  const localListRecord = { ...listRecord };
  if (!Object.prototype.hasOwnProperty.call(listRecord[item.Country], item.State)) {
    localListRecord[item.Country][item.State] = [];
  }
  return localListRecord;
};

// TODO: check if exists other callsites, otherwise this is deprecated
const getListDataFilterValues = (request, listID) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];
    sqlUtils
      .executeOrganizationStoredProcedure(request, 'uspGetAdminAreas', parameters)
      .then((recordsets) => {
        let listRecord = {};
        for (let i = 0; i < recordsets.length; i += 1) {
          const item = recordsets[i];
          listRecord = addCountry(item, listRecord);
          listRecord = addState(item, listRecord);
          listRecord[item.Country][item.State].push(item['Sub State']);
        }
        resolve(listRecord);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          request,
          errorUtils.ERROR_CODES.failedToGetList,
          `Failed to build fiter data for list location for List ${listID}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @summary this function is an extraction of the getListDataFilterValues for formatting filter countries
 * @param {Array} listLocations array of locations with fields [Country, State, 'Sub State']
 */
const formatListLocationDataForFilter = (listLocations) => {
  let listRecord = {};

  for (let i = 0; i < listLocations.length; i += 1) {
    const item = listLocations[i];

    // Initialize country if it doesn't exist
    if (!listRecord[item.Country]) {
      listRecord[item.Country] = new Map(); // Use Map for unique States within each Country
    }

    // Initialize state within the country if it doesn't exist
    if (!listRecord[item.Country].has(item.State)) {
      listRecord[item.Country].set(item.State, new Set()); // Use Set for unique Sub States within each State
    }

    // Add the Sub State to the Set within the specific State
    listRecord[item.Country].get(item.State).add(item['Sub State']);
  }

  // Convert Maps and Sets to objects and arrays for final output
  const formattedListRecord = {};
  for (const country in listRecord) {
    formattedListRecord[country] = {};
    for (const [state, subStates] of listRecord[country]) {
      formattedListRecord[country][state] = Array.from(subStates); // Convert Set to array
    }
  }

  return formattedListRecord;
};

const mapCommodityRiskValuesToDatabaseValues = (arr) => {
  const map = {
    low: 0,
    medium: 1,
    high: 2,
  };
  return arr?.map((item) => map[item]);
};

module.exports = {
  getListDataFilterValues,
  formatListLocationDataForFilter,
  mapCommodityRiskValuesToDatabaseValues,
};
