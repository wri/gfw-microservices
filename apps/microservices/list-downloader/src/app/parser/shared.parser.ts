import { cloneRow, formatPct, validatePct } from '../shared/functions';

const locationNameParser = ({ data, dataRow }) => {
  const { 'Investment Name': investmentName, 'Location Name': locationName } =
    data;
  if (investmentName) {
    if (investmentName.includes(',')) {
      dataRow.push('"' + investmentName + '"');
    } else {
      dataRow.push(investmentName);
    }
  } else if (locationName) {
    if (locationName.includes(',')) {
      dataRow.push('"' + locationName + '"');
    } else {
      dataRow.push(locationName);
    }
  }
};

const listNameParser = ({ data, dataRow }) => {
  const { list_name } = data;
  dataRow.push(list_name ?? '');
};

const pieChartParser = ({ operation, dataRow, data, csvData }) => {
  operation.composites.forEach((field) => {
    const categoryData = data[field.attribute]
      ? JSON.parse(data[field.attribute])
      : {};

    const rowValue = Object.values(categoryData)
      .flatMap((category) => Object.values(category))
      .reduce((acc, value) => acc + value, 0);

    Object.keys(categoryData).forEach((category) => {
      const categoryValues = categoryData[category];
      const currentRow = cloneRow(dataRow);
      let categoryCount = 0;

      Object.values(categoryValues).forEach((value: number) => {
        categoryCount += value;
      });

      const { label } = field;
      currentRow.push(label ?? '');
      currentRow.push(category);

      let layerPercent = formatPct(
        validatePct((categoryCount / rowValue) * 100)
      );
      if (!categoryCount || !rowValue) {
        layerPercent = '0';
      }
      currentRow.push(layerPercent);

      csvData.push(currentRow);
    });
  });
};

const accumulateYearlyParser = (data, operationName) => {
  let total = 0;
  if (Object.prototype.hasOwnProperty.call(data, operationName)) {
    const yearlyData = JSON.parse(data[operationName]);
    if (Array.isArray(yearlyData)) {
      total = yearlyData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.result,
        0
      );
    } else if (typeof yearlyData === 'number') {
      total += yearlyData;
    } else {
      total = Object.entries(yearlyData).reduce(
        (accumulator, [, currentValue]) => {
          if (typeof currentValue === 'number') {
            return accumulator + currentValue;
          }
          return accumulator;
        },
        0
      );
    }
  }
  return total;
};

export {
  locationNameParser,
  listNameParser,
  pieChartParser,
  accumulateYearlyParser,
};
