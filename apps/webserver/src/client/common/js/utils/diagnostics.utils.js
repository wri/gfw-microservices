/** ******************************************************************
 *   @name : diagnostics.utils.js
 *   @description : This file should provide helper utility methods
 *                  to help parse and data manipulataion for Diagnostics
 *
 *   @function {formatNum}
 *   @function {formatPct}
 *   @function {prettifyNum}
 *   @function {validatePct}
 *   @function {withCommas}
 *
 ********************************************************************/

// Logic follows ticket #930 requirements
const formatNum = (value) => {
  let preparedValue;
  if (value >= 10 || value === 0) {
    preparedValue = Math.round(value);
  } else {
    preparedValue = parseFloat(value).toFixed(2);
  }
  return preparedValue;
};

const formatPct = (value) => value.toFixed(2);

// Formats number with commas
const prettifyNum = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const validatePct = (percentage) => {
  if (percentage > 100) {
    return 100;
  } else if (isNaN(percentage) || !isFinite(percentage) || Math.sign(percentage) === -1) {
    return 0;
  } else {
    return percentage;
  }
};

const withCommas = (num) => {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

module.exports = {
  formatNum,
  formatPct,
  prettifyNum,
  validatePct,
  withCommas,
};
