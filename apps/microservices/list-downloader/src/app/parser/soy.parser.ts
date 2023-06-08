import { cloneRow, formatPct, validatePct } from '../shared/functions';

const _soyParserForPre2001 = ({ data, currentRow }) => {
  const totalPre2001 = data.soy_pre2001_nonforest_area;

  if (!currentRow) return;

  const pre2001Percent = formatPct(validatePct((totalPre2001 / data.total_area) * 100));

  if (pre2001Percent) {
    currentRow.push(pre2001Percent);
  }

  if (totalPre2001) {
    currentRow.push(totalPre2001);
  }
};

const _soyParserForAfter2001 = ({ data, dataRow }) => {
  const { soy_total_area } = data;

  if (!soy_total_area) return;

  const soyTotalArea = JSON.parse(soy_total_area);
  let totalSoy = 0;

  Object.keys(soyTotalArea).forEach((year) => {
    totalSoy += soyTotalArea[year];
  });
  const currentRow = cloneRow(dataRow);
  const soyPercent = formatPct(validatePct((totalSoy / data.total_area) * 100));

  if (soyPercent) {
    currentRow.push(soyPercent);
  }

  if (totalSoy) {
    currentRow.push(totalSoy);
  }
  return currentRow;
};

const soyParser = ({ dataRow, data, csvData }) => {
  const currentRow = _soyParserForAfter2001({ data, dataRow });
  _soyParserForPre2001({ data, currentRow });

  if (!currentRow) return;

  csvData.push(currentRow);
};

export { soyParser };
