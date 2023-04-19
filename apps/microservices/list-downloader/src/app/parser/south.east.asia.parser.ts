import {
  cloneRow,
  formatPct,
  validatePct,
  parseListData,
} from '../shared/functions';

const southEastAsiaOverlapParser = ({
  operation,
  listLevelAnalysis,
  data,
  dataRow,
  csvData,
}) => {
  operation.composites.forEach((field) => {
    const totalStatValue = parseListData(field.attribute, [listLevelAnalysis]);
    const currentRow = cloneRow(dataRow);

    if (totalStatValue > 0) {
      const yearlyData = data[field.attribute]
        ? JSON.parse(data[field.attribute])
        : {};

      if (isNaN(parseInt(yearlyData)) === true) {
        let totalStatV = 0;

        Object.keys(yearlyData).forEach((locationName) => {
          totalStatV += yearlyData[locationName];
        });

        Object.keys(yearlyData).forEach((locationName) => {
          const nestedRow = cloneRow(currentRow);
          nestedRow.push(field.label);
          nestedRow.push(locationName);
          const percent = formatPct(
            validatePct((yearlyData[locationName] / totalStatV) * 100)
          );
          nestedRow.push(percent);
          if (totalStatV > 0) {
            csvData.push(nestedRow);
          }
        });
      } else {
        const currentRowIn = cloneRow(dataRow);
        currentRowIn.push(field.label);
        currentRowIn.push('Within Forest Moratorium');
        const percentIn = formatPct(
          validatePct((yearlyData / data.total_area) * 100)
        );
        currentRowIn.push(percentIn);
        csvData.push(currentRowIn);

        const hectaresOut = data.total_area - yearlyData;
        const currentRowOut = cloneRow(dataRow);
        currentRowOut.push(field.label);
        currentRowOut.push('Outside Forest Moratorium');
        const percentOut = formatPct(
          validatePct((hectaresOut / data.total_area) * 100)
        );
        currentRowOut.push(percentOut);
        csvData.push(currentRowOut);
      }
    }
  });
};

export { southEastAsiaOverlapParser };
