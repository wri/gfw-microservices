import { cloneRow } from '../shared/functions';

const filterBelow2021 = (ax) =>
  Object.entries(ax).reduce((acc, [key, value]) => {
    if (parseInt(key, 10) < 2021) {
      acc[key] = value;
    }
    return acc;
  }, {});

const priorityLabel = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

const categoryParser = ({ totalProp, currentRow }) => {
  const lastYear =
    totalProp[Object.keys(totalProp)[Object.keys(totalProp).length - 1]];

  const label = priorityLabel[lastYear];
  if (label) {
    currentRow.push(label);
  }
};

const lastYearParser = ({ totalProp, currentRow }) => {
  const years = Object.keys(totalProp);
  if (years && years.length > 0) {
    currentRow.push(totalProp[years[years.length - 1]]);
  } else {
    currentRow.push('');
  }
};

const palmRiskAnalysisParser = ({ operation, data, dataRow, csvData }) => {
  const currentRow = cloneRow(dataRow);
  operation.fields.forEach((field) => {
    if (field.type === 'yearly') {
      let totalProp = data[field.attribute]
        ? JSON.parse(data[field.attribute])
        : {};

      totalProp = filterBelow2021(totalProp);

      const val = Object.entries(totalProp).reduce((acc, [, value]) => {
        if (typeof value === 'number') {
          return acc + value;
        }
        return acc;
      }, 0);

      if (field.parsed === 'category') {
        categoryParser({ totalProp, currentRow });
      } else if (field.parsed === 'aggregate' && val) {
        currentRow.push(val);
      } else if (field.parsed === 'last') {
        lastYearParser({ totalProp, currentRow });
      }
    } else if (field.type === 'lastYear') {
      const rowValue = data[field.attribute];
      let rowObj = JSON.parse(rowValue);
      rowObj = filterBelow2021(rowObj);

      const years = Object.keys(rowObj);
      const value = rowObj[years[years.length - 1]];
      const priority = priorityLabel[value];

      if (priority) {
        currentRow.push(priority);
      }
    }
  });

  if (currentRow.length > 0) {
    csvData.push(currentRow);
  }
};

export { palmRiskAnalysisParser };
