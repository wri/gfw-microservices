/**
 * Calculate the data for each Colombia layer.
 *
 * @param {Object} operation - object that describe how to calculate the percentage.
 * @param {Array<>} data - input data that will be used to calculate the percentage.
 * @param {Array<>} dataRow - array that contains data from other step.
 * @param {Array<>} csvData - array that contains the final data.
 */

const COVERAGE_DECIMAL_PLACES = 2;
const START_YEAR = 2001;
const END_YEAR = 2023;

export const colombiaLayers = ({ operation, data, dataRow, csvData }) => {
  const { name, composites } = operation;

  if (!composites || (name !== 'colombiaOverlap' && name !== 'colombiaDeforestation'))
    return csvData;

  composites.forEach((composite) => {
    const { type, label, attribute, hasSecondarySubLayers, constantLayers } = composite;

    if (type !== 'country' && type !== 'category') return;

    try {
      if (type === 'country') {
        let parsedData = JSON.parse(data[attribute])?.COL || {};

        if (hasSecondarySubLayers) {
          parsedData = splitObjAndCreateNestedChildren(parsedData);
        }

        if (constantLayers) {
          parsedData = createObjWithEmptyYears(parsedData, constantLayers);
        }

        const totalForAllSubLayers = calculateTotalLossForAllCategories(parsedData);

        Object.entries(parsedData).forEach(([subLayerName, subLayerValue]) => {
          const totalPerSubLayer = calculateTotalLossForAllCategories(subLayerValue);

          const percentagePerSubLayer = ((totalPerSubLayer / totalForAllSubLayers) * 100).toFixed(
            COVERAGE_DECIMAL_PLACES
          );

          const totalLossBySecondarySubLayerPerYear =
            calculateTotalLossBySecondarySubLayerPerYear(subLayerValue);

          Object.entries(subLayerValue).forEach(
            ([secondarySubLayerName, secondarySubLayerValue]) => {
              const totalPerSecondarySubLayer =
                calculateTotalLossForAllCategories(secondarySubLayerValue);

              const percentagePerSecondarySubLayer = (
                (totalPerSecondarySubLayer / totalForAllSubLayers) *
                100
              ).toFixed(COVERAGE_DECIMAL_PLACES);

              if (name === 'colombiaDeforestation') {
                if (hasSecondarySubLayers) {
                  Object.entries(secondarySubLayerValue).forEach(([year, value]) => {
                    csvData.push([
                      ...dataRow,
                      label,
                      subLayerName,
                      totalLossBySecondarySubLayerPerYear[year],
                      year,
                      totalPerSubLayer,
                      percentagePerSubLayer,
                      secondarySubLayerName ?? '',
                      value,
                      year,
                      totalPerSecondarySubLayer,
                      percentagePerSecondarySubLayer,
                    ]);
                  });
                } else {
                  csvData.push([
                    ...dataRow,
                    label,
                    subLayerName.replace(',', ' -'),
                    secondarySubLayerValue,
                    secondarySubLayerName ?? '',
                    totalPerSubLayer,
                    percentagePerSubLayer,
                  ]);
                }
              } else {
                csvData.push([
                  ...dataRow,
                  label,
                  subLayerName,
                  totalPerSubLayer,
                  percentagePerSubLayer,
                  secondarySubLayerName ?? '',
                  secondarySubLayerValue,
                  percentagePerSecondarySubLayer,
                ]);
              }
            }
          );
        });
      } else {
        const parsedData = JSON.parse(data[attribute]) || {};

        const totalForAllSubLayers = calculateTotalLossForAllCategories(parsedData);

        Object.entries(parsedData).forEach(([subLayerName, subLayerValue]) => {
          const totalPerSubLayer = calculateTotalLossForAllCategories(subLayerValue);

          const percentagePerSubLayer = ((totalPerSubLayer / totalForAllSubLayers) * 100).toFixed(
            COVERAGE_DECIMAL_PLACES
          );

          csvData.push([
            ...dataRow,
            label,
            subLayerName.replace(',', ' -'),
            totalPerSubLayer,
            percentagePerSubLayer,
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

const calculateTotalLossBySecondarySubLayerPerYear = (data) => {
  const result = {};

  for (const subLayer in data) {
    for (const year in data[subLayer]) {
      if (!result[year]) {
        result[year] = 0;
      }

      result[year] += data[subLayer][year];
    }
  }

  return result;
};

const createObjWithEmptyYears = (data, constantLayers) => {
  const newObj = { ...data };
  const keys = Object.keys(data);

  for (const layer of constantLayers) {
    if (!keys.includes(layer)) {
      newObj[layer] = (() => {
        const obj = {};

        for (let year = START_YEAR; year <= END_YEAR; year++) {
          obj[year] = 0;
        }
        return obj;
      })();
    }
  }

  return newObj;
};
