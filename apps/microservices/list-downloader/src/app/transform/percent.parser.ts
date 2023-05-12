import { cloneRow, formatPct, validatePct } from '../shared/functions';

const percentParser = (operation, dataRow, data, csvData) => {
  operation.numerators.forEach((field) => {
    const currentRow = cloneRow(dataRow);

    let tclOnAttribute = 0;
    if (data[field.tclAttribute]) {
      const yearlyData = JSON.parse(data[field.tclAttribute]);

      if (yearlyData.forEach) {
        yearlyData.forEach((year) => {
          tclOnAttribute += year.result;
        });
      } else if (typeof yearlyData === 'number') {
        tclOnAttribute += yearlyData;
      } else {
        Object.keys(yearlyData).forEach((year) => {
          tclOnAttribute += yearlyData[year];
        });
      }
    }
    const attributeExtent = data[field.extentAttribute];

    const percent = formatPct(
      validatePct((tclOnAttribute / attributeExtent) * 100)
    );

    if (field.label) {
      currentRow.push(field.label);
    }

    currentRow.push(percent);
    currentRow.push(tclOnAttribute);
    currentRow.push(attributeExtent);

    csvData.push(currentRow);
  });
};

export { percentParser };
