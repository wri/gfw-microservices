/** ******************************************************************
 *   @name : diagnostics.utils.js
 *   @description : This file should provide helper utility methods
 *                  to help parse and data manipulataion for Diagnostics
 *
 *   @function {formatNum}
 *   @function {formatPct}
 *   @function {prettifyNum}
 *   @function {validatePct}
 *   @function {getFormatedTooltipForDiagnosticsChart}
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

function getFormatedTooltipForDiagnosticsChart() {
  const { color: optionsColor, label, type } = this.options;
  const { color: seriesColor, name } = this.series;
  return `<tr>
<td style="color:${optionsColor || seriesColor};padding:0">${
    type === 'PRODES' ? `${type} (${label})` : name
  }: </td>
<td style="padding-top:0; padding-bottom: 0"><b>${prettifyNum(formatNum(this.y || 0))} ha</b></td>
</tr>`;
}

module.exports = {
  formatNum,
  formatPct,
  prettifyNum,
  validatePct,
  getFormatedTooltipForDiagnosticsChart,
};
