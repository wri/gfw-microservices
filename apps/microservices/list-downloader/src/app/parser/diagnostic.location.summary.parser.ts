import { cloneRow, formatPct, validatePct } from '../shared/functions';

const diagnosticLocationSummaryParser = ({
  operation,
  dataRow,
  data,
  csvData,
}) => {
  const currentRow = cloneRow(dataRow);
  currentRow.push(data.State);
  currentRow.push(data.Country);
  const totalArea = data.total_area;

  operation.fields.forEach((field) => {
    const fieldValue = data[field.attribute]
      ? JSON.parse(data[field.attribute])
      : 0;

    if (field.parsed === 'percent') {
      const percent = formatPct(validatePct((fieldValue / totalArea) * 100));
      currentRow.push(percent);
    } else if (field.parsed === 'aggregate') {
      currentRow.push(fieldValue.toFixed(2));
    }
  });

  operation.additionalFields.forEach((field) => {
    switch (typeof data[field.attribute]) {
      case 'number':
        currentRow.push(data[field.attribute]);
        break;
      case 'string':
        currentRow.push(data[field.attribute]);
        break;
      case 'object':
        // eslint-disable-next-line no-case-declarations
        const fieldValue = data[field.attribute]
          ? JSON.parse(data[field.attribute])
          : 0;
        if (fieldValue && field.parsed === 'percent') {
          const percent = formatPct(
            validatePct((fieldValue / totalArea) * 100)
          );
          currentRow.push(percent);
        } else if (fieldValue && field.parsed === 'aggregate') {
          currentRow.push(fieldValue.toFixed(2));
        } else {
          currentRow.push('');
        }
        break;
      default:
        //undefined
        currentRow.push('');
    }
  });

  csvData.push(currentRow);
};

export { diagnosticLocationSummaryParser };
