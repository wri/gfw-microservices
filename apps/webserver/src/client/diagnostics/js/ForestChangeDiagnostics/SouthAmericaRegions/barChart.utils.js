export const filterDataByYearRange = (data, startYear, endYear) => {
  return data.filter((entry) => {
    const year = entry.x; // 'x' represents the year
    return year >= startYear && year <= endYear;
  });
};

export const allYearsHaveZeroValue = (data) => {
  if (!data || data.length === 0) return true; // If data is empty, return true

  // Check if every year has a value of 0
  return data.every((entry) => Object.values(entry).every(({ value }) => value === 0));
};

export const getDataFromPath = (data, dataPath) => {
  const dataPathArray = dataPath.split('.');
  let result = data;
  for (const path of dataPathArray) {
    result = result?.[path];
    if (!result) break;
  }
  return result;
};

export const getDataAndCheckIfAllYearsZero = (argentinaPieChartsData, dataPath) => {
  if (!dataPath) {
    return false;
  }

  const barChartData = getDataFromPath(argentinaPieChartsData, dataPath);
  return allYearsHaveZeroValue(barChartData);
};

export const addNoOverlapArea = (overlapArea, total_area, nonOverlapAreaLabel) => {
  // Calculate the sum of the values in overlap areas
  let sumOfAreas = 0;
  for (let category in overlapArea) {
    sumOfAreas += overlapArea[category];
  }

  // Calculate the remaining area
  let nonOverlapArea = total_area - sumOfAreas;

  return { ...overlapArea, [nonOverlapAreaLabel]: nonOverlapArea };
};
