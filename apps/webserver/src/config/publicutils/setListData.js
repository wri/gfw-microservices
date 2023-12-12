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
 * @summary merges analysis data to its location data and does some clean up
 * @param {Array} locationData list locations data
 * @param {Array} locationAnalysisData location analysis data
 * @param {Object} selectedList current list context
 * @returns {Array}
 */
const setListData = (locationData = [], locationAnalysisData = [], selectedList) => {
  const data = [];
  locationData.forEach((loc) => {
    /**
     * @TODO: - ENABLE IN PHASE 1.1
     * const flag = {
     *   flag_forma: loc.flag_forma,
     *   flag_general: loc.flag_general,
     *   flag_glad: loc.flag_glad,
     *   flag_gran_chaco: loc.flag_gran_chaco,
     *   flag_terrai: loc.flag_terrai,
     *   flag_viirs: loc.flag_viirs
     * };
     */

    if (selectedList.list_name === 'Administrative Areas') {
      if (loc['Location Name']) {
        const splitsies = loc['Location Name'].split('--');
        if (splitsies.length > 0) {
          loc['Location Name'] = splitsies[splitsies.length - 1];
        }
      }
      if (loc['Investment Name']) {
        const splitsies = loc['Investment Name'].split('--');
        if (splitsies.length > 0) {
          loc['Investment Name'] = splitsies[splitsies.length - 1];
        }
      }
    }

    if (locationAnalysisData?.length > 0) {
      let analysisList =
        locationAnalysisData.find((analysis) => {
          if (
            selectedList.list_name === 'Protected Areas' ||
            selectedList.list_name === 'Administrative Areas'
          ) {
            // for protected areas and admin areas we dont match list_ids, just location ids
            return analysis.location_id === loc.location_id;
          } else {
            return analysis.location_id === loc.location_id && analysis.list_id === loc.list_id;
          }
        }) || {}; // default to an empty object if no matching element is found

      data.push({
        ...loc,
        ...analysisList,
      });
    } else {
      data.push({ ...loc });
    }
  });

  return dataCleanup(data);
};

module.exports = setListData;
