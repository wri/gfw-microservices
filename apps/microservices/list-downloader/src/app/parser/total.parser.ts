import { accumulateYearlyParser } from './shared.parser';

const totalParser = (operation, dataRow, data) => {
  const total = accumulateYearlyParser(data, operation.name);
  dataRow.push(total);
};

export { totalParser };
