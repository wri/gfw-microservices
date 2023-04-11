import { cloneRow, formatPct, validatePct } from '../shared/functions';

const locationNameParser = ({ data, dataRow }) => {
  if (data['Investment Name']) {
    if (data['Investment Name'].indexOf(',') > -1) {
      dataRow.push('"' + data['Investment Name'] + '"');
    } else {
      dataRow.push(data['Investment Name']);
    }
  } else {
    if (data['Location Name'].indexOf(',') > -1) {
      dataRow.push('"' + data['Location Name'] + '"');
    } else {
      dataRow.push(data['Location Name']);
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

    let rowValue = 0;
    Object.keys(categoryData).forEach((category) => {
      const yearlyData = categoryData[category];
      Object.keys(yearlyData).forEach((year) => {
        rowValue += yearlyData[year];
      });
    });

    Object.keys(categoryData).forEach((category) => {
      const categoryValues = categoryData[category];
      const currentRow = cloneRow(dataRow);
      let categoryCount = 0;

      Object.keys(categoryValues).forEach((year) => {
        categoryCount += categoryValues[year];
      });

      if (field.label) {
        currentRow.push(field.label);
      }
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
  if (data[operationName]) {
    const yearlyData = JSON.parse(data[operationName]);

    if (Array.isArray(yearlyData)) {
      total = yearlyData.reduce(
        (accumulator: number, currentValue) =>
          accumulator + currentValue.result,
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
