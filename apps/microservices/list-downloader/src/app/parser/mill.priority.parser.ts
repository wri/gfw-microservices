import { cloneRow } from '../shared/functions';

const commodityMillPriorityLevelYearly = ({
  field,
  yearlyData,
  dataRow,
  csvData,
}) => {
  Object.keys(yearlyData).forEach((year) => {
    const currentRow = cloneRow(dataRow);
    const rowValue = yearlyData[year];
    if (field.label) {
      currentRow.push(field.label);
    }

    if (rowValue === 0) {
      currentRow.push('Low');
    } else if (rowValue === 1) {
      currentRow.push('Medium');
    } else {
      currentRow.push('High');
    }

    currentRow.push(year);

    csvData.push(currentRow);
  });
};

export { commodityMillPriorityLevelYearly };
