const _ = require('lodash');

/**
 * @description - This function is used to filter list data
 * Example of possible filters:
 * ===========================
 * "country": "Brazil"
 * "state": "Bahia"
 * "subState": "Barreiras"
 * "page": 1
 * "pageSize": 10
 * "analysisArea": 500000
 * "sortByAttribute": "State"
 * "order": 'desc'
 * ===========================
 *
 * @param {Object} listData - The list data
 * @param {Object} filters - filters the list data
 * returns {listData<Object>: {list_analysis: []), location_analyses: [locationAttributes[], locationAnalyses[]]}} - Returns the list data filtered locations and list analysis
 */
exports.getListDataFiltered = (listData, filters) => {
  const {
    country,
    state,
    subState,
    analysisArea,
    sortByAttribute,
    order = 'asc',
    page = 0,
    pageSize = 50,
  } = filters;

  const allLocationAttributes = listData.location_analyses[0];
  const allLocationAnalysis = listData.location_analyses[1];

  let filteredLocationAttributes = !analysisArea
    ? allLocationAttributes
    : allLocationAttributes.filter((locationAttribute) => {
        return locationAttribute['Analysis Area'] > analysisArea;
      });

  filteredLocationAttributes = !sortByAttribute
    ? filteredLocationAttributes
    : _.orderBy(filteredLocationAttributes, [sortByAttribute], order);

  const filterAttributes = {
    Country: country,
    State: state,
    'Sub State': subState,
  };
  const pickByAttributesClean = _.pickBy(filterAttributes, _.identity);
  const pickLocationAttributes = _.pickBy(filteredLocationAttributes, pickByAttributesClean);
  const locationAttributesIndexes = _.keys(pickLocationAttributes);
  const finalLocationAttributes = _.values(pickLocationAttributes);
  const finalLocationAnalyses = locationAttributesIndexes.map((index) => {
    return allLocationAnalysis[index];
  });

  const elements = finalLocationAttributes.length;
  const totalPages = Math.ceil(elements / pageSize);

  let listDataFiltered;
  if ((page === 0 || page) && pageSize) {
    const numberPageSize = parseInt(pageSize, 10);
    const numberPage = parseInt(page, 10);
    const start = numberPage * numberPageSize;
    const end = (numberPage + 1) * numberPageSize;
    listDataFiltered = {
      filter_attributes: { ...filters, page, pageSize, totalPages, elements },
      list_analysis: listData.list_analysis,
      location_analyses: [
        _.slice(finalLocationAttributes, start, end),
        _.slice(finalLocationAnalyses, start, end),
      ],
    };
  } else {
    listDataFiltered = {
      filter_attributes: { ...filters, page, pageSize, totalPages, elements },
      list_analysis: listData.list_analysis,
      location_analyses: [finalLocationAttributes, finalLocationAnalyses],
    };
  }

  return listDataFiltered;
};
