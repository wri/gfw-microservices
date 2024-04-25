import { getDataFromPath, filterDataByYearRange } from './barChart.utils';

export const getBarChartData = (argentinaPieChartsData, dateRange, chartLabels) => {
  const filteredData = chartLabels.flatMap((label) => {
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
