import { cloneRow } from '../shared/functions';

const priorityLabel = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

const categoryParser = ({ totalProp, currentRow }) => {
  const lastYear =
    totalProp[Object.keys(totalProp)[Object.keys(totalProp).length - 1]];

  const label = priorityLabel[lastYear];
  currentRow.push(label);
};

const lastYearParser = ({ totalProp, currentRow }) => {
  const years = Object.keys(totalProp);
  if (years && years.length > 0) {
    currentRow.push(totalProp[years[years.length - 1]]);
  } else {
    currentRow.push('');
  }
};

const palmRiskAnalysisParser = ({ operation, dataRow, data, csvData }) => {
  const currentRow = cloneRow(dataRow);
  operation.fields.forEach((field) => {
    if (field.type === 'yearly') {
      const totalProp = data[field.attribute]
        ? JSON.parse(data[field.attribute])
        : {};

      const val = Object.entries(totalProp).reduce((acc, [, value]) => {
        if (typeof value === 'number') {
          return acc + value;
        }
        return acc;
      }, 0);

      if (field.parsed === 'category') {
        categoryParser({ totalProp, currentRow });
      } else if (field.parsed === 'aggregate') {
        currentRow.push(val);
      } else if (field.parsed === 'last') {
        lastYearParser({ totalProp, currentRow });
      }
    } else if (field.type === 'lastYear') {
      const rowValue = data[field.attribute];
      const rowObj = JSON.parse(rowValue);

      const years = Object.keys(rowObj);
      const value = rowObj[years[years.length - 1]];
      const priority = priorityLabel[value];

      currentRow.push(priority);
    }
  });

  csvData.push(currentRow);
};

export { palmRiskAnalysisParser };
