import { checkAndFormatStringWithComma } from '../transform/treat.string.with.comma';
import { isObjInCountryFormat } from '../shared/functions';

/**
 * Argentina Layers Key Columns
 *
 * @summary [landmark_by_category_area] uses total_area to calculate the percentage
 * can look like: '{"Not Reported":5021.8882}'
 *
 * @summary [arg_otbn_area] uses total_area
 * can look like: '{"Category II":1301.57,"Category I":639.0568}'
 *
 * @summary [protected_areas_by_category_area] uses total_area
 * can look like: '{"Ramsar Site, Wetland of International Importance":5021.8882}'
 */

enum LayersKeys {
  landmark_by_category_area = 'landmark_by_category_area',
  arg_otbn_area = 'arg_otbn_area',
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

  getSumOfValues() {
    const values = this.layerData.reduce((acc: number, [, value]) => {
      if (typeof value === 'number') {
        acc += value;
      }
      return acc;
    }, 0) as number;

    return values;
  }

  applyKeyFormatting(key: string) {
    const overrides = {
      'Not Reported': '',
    };

    const newKey = key in overrides ? overrides[key] : key;

    return checkAndFormatStringWithComma(newKey);
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
    // sort by column
    const sortedLayerData = this.layerData.sort((a, b) => {
      if (a[ENTRY_VALUE_INDEX] < b[ENTRY_VALUE_INDEX]) {
        return -1;
      } else if (a[ENTRY_VALUE_INDEX] > b[ENTRY_VALUE_INDEX]) {
        return 1;
      } else {
        return 0;
      }
    });

    const sliceToInclude = sortedLayerData.slice(0, limit - 1);
    const sliceToExclude = sortedLayerData.slice(limit - 1);

    const groupedOtherValues = sliceToExclude.reduce((acc, [, value]) => {
      if (typeof value === 'number') {
        acc = acc + value;
      }
      return acc;
    }, 0);

    this.layerData = [...sliceToInclude, ['Other', groupedOtherValues]];

    return this;
  }

  /**
   * inserts into layerData the non-overlap values from data
   * @returns this
   */
  handleNonOverlapDifference() {
    const total = getTotalArea(this.data);
    const sumOfValues = this.getSumOfValues();

    const nonOverlapValue = total - sumOfValues;
    this.layerData.push(['Non-Overlap', nonOverlapValue]);

    return this;
  }

  handleRowPercentageAndFormat() {
    // avoid dividing by zero, number gets formatted down the stream
    const total = Math.max(getTotalArea(this.data), 0.01);

    this.layerData = this.layerData.map(([key, value]) => {
      let percent = 0;
      if (typeof value === 'number') {
        percent = (value / total) * 100;
      }

      key = this.applyKeyFormatting(key);

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
    .handleRowPercentageAndFormat()
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

const getTotalArea = (data) => data.country_area?.ARG ?? data.total_area;
