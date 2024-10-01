import { getDataFromPath, filterDataByYearRange } from './barChart.utils';

export const getBarChartData = (argentinaPieChartsData, dateRange, chartLabels) => {
  const filteredData = chartLabels?.flatMap((label) => {
    if (!label.checked) return [];
    const data = getDataFromPath(argentinaPieChartsData, label.dataPath);

    if (data) {
      return [
        {
          id: label.id,
          name: label.name,
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

export const getBarChartDataWithTwoLevels = (rawBarChartData, dateRange, chartConfiguration) => {
  if (!chartConfiguration?.dataPath || !chartConfiguration?.subLayers) return [];

  const typeData = getDataFromPath(rawBarChartData, chartConfiguration.dataPath);
  if (!typeData) return [];

  const formattedBarChartDataColombia = formatBarChartDataWithTwoLevels(typeData);

  const filteredData = chartConfiguration.subLayers.flatMap((label) => {
    const chartLabel = formattedBarChartDataColombia?.[label.id] ?? [];

    return [
      {
        id: label.id,
        name: label.legend,
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

const formatBarChartDataWithTwoLevels = (rawBarChartsData) => {
  const result = {};

  try {
    Object.keys(rawBarChartsData).forEach((category) => {
      const yearsMap = {};

      Object.values(rawBarChartsData[category]).forEach((records) => {
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
