import {
  DIAGNOSTIC_COVERAGE_DECIMAL_PLACES,
  DIAGNOSTIC_ANALYSIS_PERIOD,
} from '@wri-monorepos/constants';

import { isObjInCountryFormat, getTotalArea, filterYearsByDateRange } from '../shared/functions';

enum ColombiaOverlapField {
  ClassifiedRegionArea = 'classified_region_area',
  ProtectedAreasByCategoryArea = 'protected_areas_by_category_area',
  LandmarkByCategoryArea = 'landmark_by_category_area',
}

/**
 * Calculate the data for each Colombia layer.
 *
 * @param {Object} operation - object that describe how to calculate the percentage.
 * @param {Array<>} data - input data that will be used to calculate the percentage.
 * @param {Array<>} dataRow - array that contains data from other step.
 * @param {Array<>} csvData - array that contains the final data.
 */

export const colombiaLayers = ({ operation, data, dataRow, csvData }) => {
  const { name, composites } = operation;

  if (!composites || (name !== 'colombiaOverlap' && name !== 'colombiaDeforestation')) {
    return csvData;
  }

  composites.forEach((composite) => {
    const { type, label, attribute, hasSecondarySubLayers, constantLayers, nonOverlapLabel } =
      composite;

    if (type !== 'yearly' && type !== 'category') {
      return;
    }

    let parsedData = {};

    try {
      const tempParsedData = JSON.parse(data[attribute] || '{}');
      parsedData = tempParsedData?.COL || {};

      if (type === 'category' && !isObjInCountryFormat(tempParsedData)) {
        parsedData = tempParsedData;
      }

      if (operation.startYear && operation.endYear) {
        parsedData = filterYearsByDateRange(parsedData, operation.startYear, operation.endYear);
      }

      if (hasSecondarySubLayers) {
        parsedData = splitObjAndCreateNestedChildren(parsedData);
      }

      if (constantLayers) {
        parsedData = createObjWithEmptyYears(parsedData, constantLayers, operation);
      }

      const totalForAllSubLayers = calculateTotalLossForAllCategories(parsedData);

      const totalArea = getTotalArea(data, 'COL');

      if (totalArea === 0) {
        return;
      }

      Object.entries(parsedData).forEach(([subLayerName, subLayerValue]) => {
        const totalPerSubLayer = calculateTotalLossForAllCategories(subLayerValue);

        if (type === 'category') {
          const name =
            attribute === ColombiaOverlapField.LandmarkByCategoryArea
              ? 'Overlap'
              : subLayerName.replace(',', ' -');
          csvData.push([
            ...dataRow,
            label,
            name,
            totalPerSubLayer,
            getOverlapPercentage(totalPerSubLayer, totalArea),
            '',
            '',
            '',
          ]);

          return;
        }

        const percentagePerSubLayer = getOverlapPercentage(totalPerSubLayer, totalForAllSubLayers);

        Object.entries(subLayerValue).forEach(([secondarySubLayerName, secondarySubLayerValue]) => {
          const totalPerSecondarySubLayer =
            calculateTotalLossForAllCategories(secondarySubLayerValue);

          const percentagePerSecondarySubLayer = getOverlapPercentage(
            totalPerSecondarySubLayer,
            totalForAllSubLayers
          );

          if (name === 'colombiaDeforestation') {
            if (hasSecondarySubLayers) {
              Object.entries(secondarySubLayerValue).forEach(([year, value]) => {
                csvData.push([
                  ...dataRow,
                  label,
                  subLayerName,
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
                '',
                secondarySubLayerValue,
                secondarySubLayerName ?? '',
                totalPerSubLayer,
                percentagePerSubLayer,
              ]);
            }
          } else {
            // colombiaOverlap
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
        });
      });

      if (type === 'category') {
        const nonOverlap = totalArea - totalForAllSubLayers;

        csvData.push([
          ...dataRow,
          label,
          nonOverlapLabel ?? 'Non-overlap',
          nonOverlap,
          getOverlapPercentage(nonOverlap, totalArea),
          '',
          '',
          '',
        ]);
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
  if (!obj) {
    return 0;
  }

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

const createObjWithEmptyYears = (data, constantLayers, operation) => {
  const newObj = { ...data };
  const keys = Object.keys(data);

  for (const layer of constantLayers) {
    if (!keys.includes(layer)) {
      newObj[layer] = (() => {
        const obj = {};
        const startYear = operation?.startYear ?? DIAGNOSTIC_ANALYSIS_PERIOD.START_YEAR;
        const endYear = operation?.endYear ?? DIAGNOSTIC_ANALYSIS_PERIOD.END_YEAR;

        for (let year = startYear; year <= endYear; year++) {
          obj[year] = 0;
        }
        return obj;
      })();
    }
  }

  return newObj;
};

const getOverlapPercentage = (value: number, totalArea: number) => {
  return ((value / totalArea) * 100).toFixed(DIAGNOSTIC_COVERAGE_DECIMAL_PLACES);
};
