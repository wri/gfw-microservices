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

  if (!composites || (name !== 'colombiaOverlap' && name !== 'colombiaDeforestation'))
    return csvData;

  composites.forEach((composite) => {
    const { type, label, attribute, withSubLayers } = composite;

    if (type !== 'country' && type !== 'category') return;

    try {
      if (type === 'country') {
        let parsedData = JSON.parse(data[attribute])?.COL || {};

        if (withSubLayers) {
          parsedData = splitObjAndCreateNestedChildren(parsedData);
        }

        const totalForAllCategories = calculateTotalLossForAllCategories(parsedData);

        Object.entries(parsedData).forEach(([categoryName, categoryValue]) => {
          const totalPerCategory = calculateTotalLossForAllCategories(categoryValue);

          const totalLossBySubcategoryPerYear =
            calculateTotalLossBySubcategoryPerYear(categoryValue);

          Object.entries(categoryValue).forEach(([subCategoryName, subCategoryValue]) => {
            const totalPerSubCategory = calculateTotalLossForAllCategories(subCategoryValue);
            const percentagePerCategory = (
              (totalPerCategory / totalForAllCategories) *
              100
            ).toFixed(COVERAGE_DECIMAL_PLACES);

            const percentagePerSubCategory = (
              (totalPerSubCategory / totalForAllCategories) *
              100
            ).toFixed(COVERAGE_DECIMAL_PLACES);

            if (withSubLayers) {
              Object.entries(subCategoryValue).forEach(([year, value]) => {
                csvData.push([
                  ...dataRow,
                  label,
                  categoryName,
                  totalLossBySubcategoryPerYear[year],
                  year,
                  totalPerCategory,
                  '%',
                  subCategoryName ?? '',
                  value,
                  year,
                  totalPerSubCategory,
                  percentagePerSubCategory,
                ]);
              });
            } else {
              csvData.push([
                ...dataRow,
                label,
                categoryName,
                totalPerCategory,
                percentagePerCategory,
                subCategoryName ?? '',
                subCategoryValue,
                percentagePerSubCategory,
              ]);
            }
          });
        });
      } else {
        const parsedData = JSON.parse(data[attribute]) || {};

        const totalForAllCategories = calculateTotalLossForAllCategories(parsedData);

        Object.entries(parsedData).forEach(([categoryName, categoryValue]) => {
          const totalPerCategory = calculateTotalLossForAllCategories(categoryValue);

          const percentagePerCategory = ((totalPerCategory / totalForAllCategories) * 100).toFixed(
            COVERAGE_DECIMAL_PLACES
          );

          csvData.push([
            ...dataRow,
            label,
            categoryName.replace(',', ' -'),
            totalPerCategory,
            percentagePerCategory,
            '',
            totalPerCategory,
            percentagePerCategory,
          ]);
        });
      }
    } catch (e) {
      /* empty */
    }
  });
};

// This function splits Colombian tree cover loss object and create nested children
const splitObjAndCreateNestedChildren = (treeCoverLoss) => {
  const result = {} as { Unconditioned: unknown; Conditioned: unknown; Restrictions: unknown };

  for (const [key, value] of Object.entries(treeCoverLoss)) {
    const [mainKey, subKeyTemp] = key.split(';').map((k) => k.trim());

    if (!result[mainKey]) {
      result[mainKey] = {};
    }

    const subKey = subKeyTemp ?? '';

    result[mainKey][subKey] = value;
  }

  const orderedData = {
    Unconditioned: result.Unconditioned ?? {},
    Conditioned: result.Conditioned ?? {},
    Restrictions: result.Restrictions ?? {},
  };

  return orderedData;
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

const calculateTotalLossBySubcategoryPerYear = (data) => {
  const result = {};

  for (const category in data) {
    for (const year in data[category]) {
      if (!result[year]) {
        result[year] = 0;
      }

      result[year] += data[category][year];
    }
  }

  return result;
};
