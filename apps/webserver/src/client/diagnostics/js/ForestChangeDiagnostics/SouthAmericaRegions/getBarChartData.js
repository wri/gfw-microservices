const filterDataByYearRange = (data, startYear, endYear) => {
  return data.filter((entry) => {
    const year = entry.x; // 'x' represents the year
    return year >= startYear && year <= endYear;
  });
};

export const getBarChartData = (argentinaPieChartsData, dateRange, chartLabels) => {
  const filteredData = chartLabels.flatMap((label) => {
    if (!label.checked) return [];
    const dataPathArray = label.dataPath.split('.');
    let data = argentinaPieChartsData;
    for (const path of dataPathArray) {
      data = data?.[path];
      if (!data) break;
    }

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
