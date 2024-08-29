/**
 * Calculate the data for each Colombia layer.
 *
 * @param {Object} operation - object that describe how to calculate the percentage.
 * @param {Array<>} data - input data that will be used to calculate the percentage.
 * @param {Array<>} dataRow - array that contains data from other step.
 * @param {Array<>} csvData - array that contains the final data.
 */

const COVERAGE_DECIMAL_PLACES = 2;

export const colombiaLayers = ({ operation, data, dataRow, csvData }) => {
  const { name, composites } = operation;

  if (name === 'colombiaLayers' && composites) {
    composites.forEach((composite) => {
      const { type, label, attribute } = composite;

      if (type === 'category') {
        // parseColombiaLayer(composite, data, dataRow, csvData);
        let parsedData;
        try {
          parsedData = JSON.parse(data[attribute])?.COL || {};
        } catch (e) {
          parsedData = {};
        }

        const categories = splitObjAndCreateNestedChildren(parsedData, false);

        const totalForAllCategories = calculateTotalLossForAllCategories(categories);

        Object.entries(categories).forEach(([categoryName, categoryValue]) => {
          const totalPerCategory = calculateTotalLossForAllCategories(categoryValue);

          Object.entries(categoryValue).forEach(([subCategoryName, subCategoryValue]) => {
            const totalPerSubCategory = calculateTotalLossForAllCategories(subCategoryValue);
            csvData.push([
              ...dataRow,
              label,
              categoryName,
              totalPerCategory,
              ((totalPerCategory / totalForAllCategories) * 100).toFixed(COVERAGE_DECIMAL_PLACES),
              subCategoryName,
              subCategoryValue,
              ((totalPerSubCategory / totalForAllCategories) * 100).toFixed(
                COVERAGE_DECIMAL_PLACES
              ),
            ]);
          });
        });
      }
    });
  }
  return csvData;
};

// This function splits Colombian tree cover loss object and create nested Children to make it easy to show the data in the frontend
const splitObjAndCreateNestedChildren = (treeCoverLoss, isDataWithYears = true) => {
  const result = {};

  for (const [key, value] of Object.entries(treeCoverLoss)) {
    const [mainKey, subKey] = key.split(';').map((k) => k.trim());

    if (!result[mainKey]) {
      result[mainKey] = {};
    }

    result[mainKey][subKey] = isDataWithYears ? toApproximateValueFormat(value) : value;
  }

  return result;
};

// do we still need to handle 'approx' string from database?
const toApproximateValueFormat = (obj: unknown) => {
  return Object.entries(obj)
    .map(([key, value]) => ({
      year: Number(key.substring(0, 4)),
      value,
      approximateValue: /approx/.test(key),
    }))
    .sort((a, b) => a.year - b.year);
};

const calculateTotalLossForAllCategories = (obj) => {
  if (!obj) return 0;

  let sum = 0;

  function recursiveSum(data) {
    if (Array.isArray(data)) {
      data.forEach((item) => {
        sum += item.value;
      });
    } else if (typeof data === 'object') {
      Object.values(data).forEach((value) => {
        recursiveSum(value);
      });
    } else if (typeof data === 'number') {
      sum += data;
    }
  }

  recursiveSum(obj);
  return sum;
};
