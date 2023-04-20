import { cloneRow, formatPct, validatePct } from '../shared/functions';

const percentParser = ({ field, fieldValue, totalArea, currentRow }) => {
  if (fieldValue && totalArea && field.parsed === 'percent') {
    const percent = formatPct(validatePct((fieldValue / totalArea) * 100));
    if (percent) {
      currentRow.push(percent);
    }
  }
};

const aggregateParser = ({ currentRow, field, fieldValue }) => {
  if (fieldValue && field.parsed === 'aggregate') {
    currentRow.push(fieldValue.toFixed(2));
  }
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

  if (Country) {
    currentRow.push(Country);
  }

  if (State) {
    currentRow.push(State);
  }

  fields?.forEach((field) => {
    const fieldValue = data[field.attribute]
      ? JSON.parse(data[field.attribute])
      : 0;
    percentParser({ currentRow, field, fieldValue, totalArea });
    aggregateParser({ currentRow, field, fieldValue });
  });

  additionalFields?.forEach((field) => {
    switch (typeof data[field.attribute]) {
      case 'number':
      case 'string':
        if (data[field.attribute]) {
          currentRow.push(data[field.attribute]);
        }
        break;
      case 'object':
        // eslint-disable-next-line no-case-declarations
        const [fieldValue] = Object.values(data[field.attribute]) ?? [0];

        percentParser({ currentRow, field, fieldValue, totalArea });
        aggregateParser({ currentRow, field, fieldValue });
        break;
    }
  });

  if (currentRow && currentRow.length > 0) {
    csvData.push(currentRow);
  }
};

export { diagnosticLocationSummaryParser };
