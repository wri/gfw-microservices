import { cloneRow } from '../shared/functions';
import { DIAGNOSTIC_ANALYSIS_PERIOD } from '@wri-monorepos/constants';

const filterBelowEndYear = (ax) =>
  Object.entries(ax).reduce((acc, [key, value]) => {
    if (parseInt(key, 10) <= DIAGNOSTIC_ANALYSIS_PERIOD.COMMODITY_RISK_END_YEAR) {
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
  const lastYearKey = Object.keys(totalProp)[Object.keys(totalProp).length - 1];
  if (lastYearKey !== undefined) {
    const lastYear = totalProp[lastYearKey];
    const label = priorityLabel[lastYear];
    if (label !== undefined) {
      currentRow.push(label);
    }
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
      let totalProp = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};

      totalProp = filterBelowEndYear(totalProp);
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
      rowObj = filterBelowEndYear(rowObj);

      const years = Object.keys(rowObj);
      if (years.length > 0) {
        const value = rowObj[years[years.length - 1]];
        const priority = priorityLabel[value];
        if (priority !== undefined) {
          currentRow.push(priority);
        }
      }
    }
  });

  if (currentRow.length > 0) {
    csvData.push(currentRow);
  }
};

export { palmRiskAnalysisParser };
