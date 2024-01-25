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
          errorUtils.errorCodes.failedToGetList,
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
 * @returns {Array} array of locations of [Country, [State, [SubState]]]
 */
const formatListLocationDataForFilter = (listLocations) => {
  let listRecord = {};
  for (let i = 0; i < listLocations.length; i += 1) {
    const item = listLocations[i];
    listRecord = addCountry(item, listRecord);
    listRecord = addState(item, listRecord);
    listRecord[item.Country][item.State].push(item['Sub State']);
  }
  return listRecord;
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
