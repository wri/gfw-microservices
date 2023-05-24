import { cloneRow, formatPct, validatePct } from '../shared/functions';

const percentParser = ({ fieldValue, totalArea }) => {
  const percent = formatPct(validatePct((fieldValue / totalArea) * 100));
  if (percent) {
    return percent;
  }
};

const aggregateParser = ({ fieldValue }) => {
  return fieldValue.toFixed(2);
};

const diagnosticLocationSummaryParser = ({
  operation,
  data,
  dataRow,
  csvData,
}) => {
  const currentRow = cloneRow(dataRow);
  const { Country, State, total_area: totalArea } = data;
  const { fields, additionalFields } = operation;

  if (State) {
    currentRow.push(State);
  }

  if (Country) {
    currentRow.push(Country);
  }

  fields?.forEach((field) => {
    const fieldValue = data[field.attribute]
      ? JSON.parse(data[field.attribute])
      : 0;

    if (field.parsed === 'percent') {
      currentRow.push(percentParser({ fieldValue, totalArea }));
    } else if (field.parsed === 'aggregate') {
      currentRow.push(aggregateParser({ fieldValue }));
    }
  });

  additionalFields?.forEach((field) => {
    let value = '';
    switch (typeof data[field.attribute]) {
      case 'number':
      case 'string':
        value = data[field.attribute];
        break;
      case 'object':
        if (data[field.attribute] !== null) {
          const [fieldValue] = Object.values(data[field.attribute]) ?? [0];
          if (fieldValue && field.parsed === 'percent') {
            value = percentParser({ fieldValue, totalArea });
          } else if (fieldValue && field.parsed === 'aggregate') {
            value = aggregateParser({ fieldValue });
          }
        }
    }
    currentRow.push(value);
  });

  if (currentRow && currentRow.length > 0) {
    csvData.push(currentRow);
  }
};

export { diagnosticLocationSummaryParser };
