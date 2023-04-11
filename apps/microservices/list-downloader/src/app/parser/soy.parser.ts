import { cloneRow, formatPct, validatePct } from '../shared/functions';

const soyParser = ({ dataRow, data, csvData }) => {
  const soyTotalArea = JSON.parse(data.soy_total_area);
  let totalSoy = 0;

  Object.keys(soyTotalArea).forEach((year) => {
    totalSoy += soyTotalArea[year];
  });
  const currentRow = cloneRow(dataRow);
  const soyPercent = formatPct(validatePct((totalSoy / data.total_area) * 100));
  currentRow.push(soyPercent);
  currentRow.push(totalSoy);

  const totalPre2001 = data.soy_pre2001_nonforest_area;
  const pre2001Percent = formatPct(
    validatePct((totalPre2001 / data.total_area) * 100)
  );
  currentRow.push(pre2001Percent);
  currentRow.push(totalPre2001);
  csvData.push(currentRow);
};

export { soyParser };
