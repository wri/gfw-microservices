import { cloneRow, formatPct, validatePct } from '../shared/functions';

export const argentinaLossOfForests = ({ operation, data, dataRow, csvData }) => {
  const { composites } = operation;

  composites.forEach(({ attribute, label }) => {
    if (!attribute) return;

    let rowValue = 0;
    const subLayers = JSON.parse(data[attribute])['ARG'] || {};

    for (const [subLayerName, data] of Object.entries(subLayers)) {
      const yearlyData = removeApproxStringAndSort(data);

      const total = Object.values(data).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );

      const totalStatValue = Math.round(total * 100) / 100;

      Object.keys(yearlyData).forEach((year) => {
        const currentRow = cloneRow(dataRow);
        rowValue = yearlyData[year];

        currentRow.push('Argentina Deforestation Data');
        currentRow.push(`${label} - ${subLayerName}`);
        currentRow.push(rowValue);
        currentRow.push(year);
        currentRow.push(totalStatValue);

        const percent = formatPct(validatePct((rowValue / totalStatValue) * 100));
        currentRow.push(percent);

        if (totalStatValue > 0) {
          csvData.push(currentRow);
        }
      });
    }
  });
  return csvData;
};

const removeApproxStringAndSort = (obj): object => {
  if (!obj) return {};

  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => [Number(key.substring(0, 4)), value])
      .sort((a: [], b: []) => a.at(0) - b.at(0))
  );
};
