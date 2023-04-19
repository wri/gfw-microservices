import { accumulateYearlyParser } from './shared.parser';

const totalParser = ({ operation, data, dataRow }) => {
  const { name } = operation;
  const total = accumulateYearlyParser(data, name);
  dataRow.push(total);
};

export { totalParser };
