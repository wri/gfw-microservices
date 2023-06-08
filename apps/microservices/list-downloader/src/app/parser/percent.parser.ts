import { cloneRow, formatPct, validatePct } from '../shared/functions';
import { accumulateYearlyParser } from './shared.parser';

const percentParser = ({ operation, data, dataRow, csvData }) => {
  operation.numerators.forEach((field) => {
    const currentRow = cloneRow(dataRow);

    const tclOnAttribute = accumulateYearlyParser(data, field.tclAttribute);
    const attributeExtent = data[field.extentAttribute];

    const percent = formatPct(validatePct((tclOnAttribute / attributeExtent) * 100));

    if (field.label) {
      currentRow.push(field.label);
    }

    currentRow.push(percent, tclOnAttribute);

    currentRow.push(attributeExtent);

    csvData.push(currentRow);
  });
};

export { percentParser };
