import { getDataFromPath, filterDataByYearRange } from './barChart.utils';

export const getBarChartData = (argentinaPieChartsData, dateRange, chartLabels) => {
  const filteredData = chartLabels?.flatMap((label) => {
    if (!label.checked) return [];
    const data = getDataFromPath(argentinaPieChartsData, label.dataPath);

    if (data) {
      return [
        {
          id: label.id,
          data: filterDataByYearRange(
            data.map(({ year, value, approximateValue }) => ({
              x: year,
              y: value,
              color: approximateValue ? `rgba(${label.color.slice(4, -1)},0.5)` : label.color,
            })),
            dateRange.startYear,
            dateRange.endYear
          ),
        },
      ];
    }
    return [];
  });

  return filteredData;
};

export const getBarChartDataColombia = (rawPieChartsData, dateRange, chartConfiguration) => {
  if (!chartConfiguration?.dataPath || !chartConfiguration?.types) return [];

  const typeData = getDataFromPath(rawPieChartsData, chartConfiguration.dataPath);
  if (!typeData) return [];

  const formattedPieChartsDataColombia = formatPieChartsDataColombia(typeData);

  const filteredData = chartConfiguration.types.flatMap((label) => {
    const chartLabel = formattedPieChartsDataColombia?.[label.name] ?? [];

    return [
      {
        id: label.id,
        data: filterDataByYearRange(
          chartLabel.map(({ year, value }) => ({
            x: year,
            y: value,
            color: label.color,
          })),
          dateRange.startYear,
          dateRange.endYear
        ),
      },
    ];
  });

  return filteredData;
};

const formatPieChartsDataColombia = (rawPieChartsData) => {
  const result = {};

  try {
    Object.keys(rawPieChartsData).forEach((category) => {
      const yearsMap = {};

      Object.values(rawPieChartsData[category]).forEach((records) => {
        records.forEach((record) => {
          if (!yearsMap[record.year]) {
            yearsMap[record.year] = 0;
          }
          yearsMap[record.year] += record.value;
        });
      });

      result[category] = Object.entries(yearsMap).map(([year, value]) => ({
        year: Number(year),
        value,
      }));
    });
  } catch (ex) {
    return {};
  }

  return result;
};
