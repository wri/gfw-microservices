import { cloneRow, formatPct, validatePct } from '../shared/functions';

const percentParser = ({ fieldValue, totalArea, currentRow }) => {
  const percent = formatPct(validatePct((fieldValue / totalArea) * 100));
  if (percent) {
    currentRow.push(percent);
  }
};

const aggregateParser = ({ currentRow, fieldValue }) => {
  currentRow.push(fieldValue.toFixed(2));
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
      percentParser({ currentRow, fieldValue, totalArea });
    } else if (field.parsed === 'aggregate') {
      aggregateParser({ currentRow, fieldValue });
    }
  });

  additionalFields?.forEach((field) => {
    switch (typeof data[field.attribute]) {
      case 'number':
      case 'string':
        currentRow.push(data[field.attribute]);
        break;
      case 'object':
        // eslint-disable-next-line no-case-declarations
        const [fieldValue] = Object.values(data[field.attribute]) ?? [0];
        if (fieldValue && field.parsed === 'percent') {
          percentParser({ currentRow, fieldValue, totalArea });
        } else if (fieldValue && field.parsed === 'aggregate') {
          aggregateParser({ currentRow, fieldValue });
        } else {
          currentRow.push('');
        }
        break;
      default:
        currentRow.push('');
    }
  });

  if (currentRow && currentRow.length > 0) {
    csvData.push(currentRow);
  }
};

export { diagnosticLocationSummaryParser };
