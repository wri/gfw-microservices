import { checkAndFormatStringWithComma } from '../transform/treat.string.with.comma';
import { isObjInCountryFormat, getTotalArea } from '../shared/functions';

/**
 * Argentina Layers Key Columns
 *
 * @summary [landmark_by_category_area] uses total_area to calculate the percentage
 * can look like: '{"Not Reported":5021.8882}'
 *
 * @summary [classified_region_area] uses total_area
 * can look like: '{"ARG":{"Category II":1301.57,"Category I":639.0568}}'
 *
 * @summary [protected_areas_by_category_area] uses total_area
 * can look like: '{"Ramsar Site, Wetland of International Importance":5021.8882}'
 */

enum LayersKeys {
  landmark_by_category_area = 'landmark_by_category_area',
  classified_region_area = 'classified_region_area',
  protected_areas_by_category_area = 'protected_areas_by_category_area',
}
// index position for value in entries
const ENTRY_VALUE_INDEX = 1;

class ArgentinaLayerUtil {
  private layerData = [];

  constructor(private key: keyof typeof LayersKeys, private data, private type: string) {
    this.setLayerData(data, type);
  }

  setLayerData(data, type) {
    let parsedData = {};

    try {
      const tempParsedData = JSON.parse(data[this.key] || '{}');

      parsedData =
        type === 'country' && isObjInCountryFormat(tempParsedData)
          ? tempParsedData?.ARG || {}
          : tempParsedData;
    } catch (e) {
      // parsedData remains an empty object if JSON parsing fails
    }

    this.layerData = Object.entries(parsedData);
  }

  // calculates sum of values from the provided data array, defaulting to all layerData.
  accumulateEntryValues(data = this.layerData) {
    return data.reduce((acc: number, [, value]) => {
      if (typeof value === 'number') {
        acc += value;
      }
      return acc;
    }, 0);
  }

  applyKeyFormatting(key: string, attribute: string) {
    if (attribute === 'landmark_by_category_area' && key === 'Not Reported') {
      return 'Overlap';
    }

    return checkAndFormatStringWithComma(key);
  }

  /**
   * modifies the layerData array into 2 groups if limit is present,
   * every category after the limit is aggregated into 'Other'
   * @param limit number
   * @returns this
   */
  handleCategoryLayerLimit(limit) {
    if (!limit || this.layerData.length <= limit) {
      return this;
    }
    // sort (asc) by entry value
    const sortedLayerData = this.layerData.sort(
      (a, b) => a[ENTRY_VALUE_INDEX] - b[ENTRY_VALUE_INDEX]
    );

    const sliceToInclude = sortedLayerData.slice(0, limit - 1);
    const sliceToExclude = sortedLayerData.slice(limit - 1);

    const groupedOtherValues = this.accumulateEntryValues(sliceToExclude);

    this.layerData = [...sliceToInclude, ['Other', groupedOtherValues]];

    return this;
  }

  /**
   * inserts into layerData the non-overlap values from data if greater than zero
   * clears all entries if all values are zero
   * @returns this
   */
  handleNonOverlapDifference() {
    const totalArea = getTotalArea(this.data, 'ARG');
    const sumOfValues = this.accumulateEntryValues();
    const nonOverlapValue = totalArea - sumOfValues;

    if (sumOfValues === 0) {
      this.layerData = [];
    }

    if (nonOverlapValue > 0) {
      this.layerData.push(['Non-Overlap', nonOverlapValue]);
    }

    return this;
  }

  handleRowPercentageAndFormat(attribute: string) {
    // avoid dividing by zero, number gets formatted down the stream
    const total = Math.max(getTotalArea(this.data, 'ARG'), 0.01);

    this.layerData = this.layerData.map(([key, value]) => {
      let percent = 0;
      if (typeof value === 'number') {
        percent = (value / total) * 100;
      }

      key = this.applyKeyFormatting(key, attribute);

      return {
        key,
        value,
        percent,
      };
    });

    return this;
  }

  getLayerRowValues() {
    return this.layerData;
  }
}

const parseArgentinaLayer = (operation, data, dataRow, csvData, type) => {
  const { attribute, limit, label } = operation;

  // parse property from the data source
  const layer = new ArgentinaLayerUtil(attribute, data, type);

  // generate rows from parsed data
  const layerGeneratedRows = layer
    .handleCategoryLayerLimit(limit)
    .handleNonOverlapDifference()
    .handleRowPercentageAndFormat(attribute)
    .getLayerRowValues();

  // write Rows
  layerGeneratedRows.forEach((element) => {
    csvData.push([...dataRow, label, ...Object.values(element)]);
  });
};

/**
 * Calculate the data for each argentina layer.
 *
 * @param {Object} operation - object that describe how to calculate the percentage.
 * @param {Array<>} data - input data that will be used to calculate the percentage.
 * @param {Array<>} dataRow - array that contains data from other step.
 * @param {Array<>} csvData - array that contains the final data.
 */
const argentinaLayers = ({ operation, data, dataRow, csvData }) => {
  const { name, composites } = operation;
  if (name === 'argentinaLayers' && composites) {
    composites.forEach((composite) => {
      const { type } = composite;
      if (type === 'category' || type === 'country') {
        parseArgentinaLayer(composite, data, dataRow, csvData, type);
      }
    });
  }
  return csvData;
};

export { argentinaLayers };
