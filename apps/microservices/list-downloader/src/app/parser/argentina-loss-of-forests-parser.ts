import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { cloneRow, formatPct, validatePct } from '../shared/functions';

const removeApproxStringAndSort = (obj): object => {
  if (!obj) return {};

  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => [Number(key.substring(0, 4)), value])
      .sort((a: [], b: []) => a.at(0) - b.at(0))
  );
};

export const generateRows = (table: string, list_name: string, data, isAggregate: boolean) => {
  const csvData = [];
  csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

  EXCEL_TEMPLATES[table].forEach((key) => {
    key.composites.forEach((field) => {
      const dataRow = [list_name];

      let rowValue = 0;
      if (!Object.prototype.hasOwnProperty.call(data ?? {}, field.attribute)) {
        return;
      }

      const subLayers = JSON.parse(data[field.attribute])['ARG'];

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

          !isAggregate && currentRow.push('location_name');
          currentRow.push('Argentina Deforestation Data');
          currentRow.push(`${field.label} - ${subLayerName}`);
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
  });
  return csvData;
};
