/**
 * Build dropdown options
 * @param {Object} dropdownOptions
 * @param {String} dropdownOptionsKey
 * @param {String} selectedValue
 * @return {Object}
 */

/***********************************************************
 * Converting function from ES6 to ES5 – Fixing IE 11 issue
 ***********************************************************
export const buildDropdownOptions = (dropdownOptions, dropdownOptionsKey = 'id', selectedValue) => {
  const dropdownObject = {};
  dropdownObject.dropdownOptions = dropdownOptions.map(item => {
    if (item.id === selectedValue) {
      dropdownObject.value = item.label;
    }
    const option = {};
    option.value = item[dropdownOptionsKey];
    option.label = item.label;
    return option;
  });
  return dropdownObject;
};
**/

export const buildDropdownOptions = function (dropdownOptions, dropdownOptionsKey, selectedValue) {
  //void 0 means undefined
  if (dropdownOptionsKey === void 0) { dropdownOptionsKey = 'id'; }
  const dropdownObject = {};
  dropdownObject.dropdownOptions = dropdownOptions.map(function (item) {
    const option = {};
    if (item[dropdownOptionsKey] === selectedValue) {
      dropdownObject.value = item.label;
      option.className = 'selected-item';
    }
    option.value = item[dropdownOptionsKey];
    option.label = item.label ? item.label : item[dropdownOptionsKey] ? item[dropdownOptionsKey] : '';
    return option;
  }).sort(function(a, b) {
    return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
  });

  return dropdownObject; 
};
