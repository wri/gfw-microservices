import { cloneRow } from '../shared/functions';
import { DIAGNOSTIC_ANALYSIS_PERIOD } from '@wri-monorepos/constants';

const filterBelowEndYear = (ax) =>
  Object.entries(ax).reduce((acc, [key, value]) => {
    if (parseInt(key, 10) <= DIAGNOSTIC_ANALYSIS_PERIOD.COMMODITY_RISK_END_YEAR) {
      acc[key] = value;
    }
    return acc;
  }, {});

const PriorityLevel = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const priorityLabel = {
  0: PriorityLevel.LOW,
  1: PriorityLevel.MEDIUM,
  2: PriorityLevel.HIGH,
};

const categoryParser = ({ totalProp, currentRow }) => {
  const lastYearKey = Object.keys(totalProp)[Object.keys(totalProp).length - 1];
  if (lastYearKey !== undefined) {
    const lastYear = totalProp[lastYearKey];
    const label = priorityLabel[lastYear];
    currentRow.push(label !== undefined ? label : PriorityLevel.LOW);
  } else {
    currentRow.push(PriorityLevel.LOW);
  }
};

const lastYearParser = ({ totalProp, currentRow }) => {
  const years = Object.keys(totalProp);
  if (years && years.length > 0) {
    const val = totalProp[years[years.length - 1]];
    if (val === undefined) {
      currentRow.push('');
    } else if (val === 0) {
      currentRow.push(0);
    } else {
      currentRow.push(val);
    }
  } else {
    currentRow.push('');
  }
};

const aggregateParser = (totalProp) => {
  const val = Object.entries(totalProp).reduce((acc, [, value]) => {
    if (typeof value === 'number') {
      return acc + value;
    }
    return acc;
  }, 0);
  return val;
};

const lastYearPriorityParser = (rowObj) => {
  const years = Object.keys(rowObj);
  if (years.length > 0) {
    const value = rowObj[years[years.length - 1]];
    const priority = priorityLabel[value];
    return priority !== undefined ? priority : PriorityLevel.LOW;
  } else {
    return PriorityLevel.LOW;
  }
};

const palmRiskAnalysisParser = ({ operation, data, dataRow, csvData }) => {
  // Always start with a cloned dataRow for compatibility
  const currentRow = cloneRow(dataRow);
  operation.fields.forEach((field, idx) => {
    let value;
    if (field.type === 'yearly') {
      let totalProp = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};
      totalProp = filterBelowEndYear(totalProp);
      if (field.parsed === 'category') {
        const tempRow = [];
        categoryParser({ totalProp, currentRow: tempRow });
        value = tempRow[0];
      } else if (field.parsed === 'aggregate') {
        value = aggregateParser(totalProp);
      } else if (field.parsed === 'last') {
        const tempRow = [];
        lastYearParser({ totalProp, currentRow: tempRow });
        value = tempRow[0];
      }
    } else if (field.type === 'lastYear') {
      const rowValue = data[field.attribute];
      let rowObj = JSON.parse(rowValue);
      rowObj = filterBelowEndYear(rowObj);
      value = lastYearPriorityParser(rowObj);
    }
    // Place value after existing columns (list_name, Location Name, etc.)
    currentRow[dataRow.length + idx] = value;
  });
  csvData.push(currentRow);
};

export { palmRiskAnalysisParser };
