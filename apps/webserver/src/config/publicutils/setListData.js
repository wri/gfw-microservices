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

const setListData = (locationData, analysisData, selectedLists) => {
  const data = [];
  locationData.forEach((loc) => {
    // TODO - ENABLE IN PHASE 1.1
    // const flag = {
    //   flag_forma: loc.flag_forma,
    //   flag_general: loc.flag_general,
    //   flag_glad: loc.flag_glad,
    //   flag_gran_chaco: loc.flag_gran_chaco,
    //   flag_terrai: loc.flag_terrai,
    //   flag_viirs: loc.flag_viirs
    // };

    if (selectedLists[0].list_name === 'Administrative Areas') {
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

    if (analysisData?.length > 0) {
      let analysisList = [];
      if (
        selectedLists[0].list_name === 'Protected Areas' ||
        selectedLists[0].list_name === 'Administrative Areas'
      ) {
        // for protected areas and admin areas we dont match list_ids, just location ids
        [analysisList] = analysisData.filter(
          (analysis) => analysis.location_id === loc.location_id
        );
      } else {
        [analysisList] = analysisData.filter(
          (analysis) => analysis.location_id === loc.location_id && analysis.list_id === loc.list_id
        );
      }
      data.push({ ...loc, ...analysisList });
    } else {
      data.push({ ...loc });
    }
  });
  return dataCleanup(data);
};

module.exports = {
  setListData,
};
