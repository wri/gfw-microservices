import { checkAndFormatStringWithComma } from '../transform/treat.string.with.comma';

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

class ArgentinaLayerUtil {
  private layerData = [];

  constructor(private key: keyof typeof LayersKeys, private data) {
    this.setLayerData(data);
  }

  setLayerData(data) {
    let parsedData;
    try {
      parsedData = JSON.parse(data[this.key]);
    } catch (e) {
      parsedData = {};
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

  handleCategoryLayerLimit(limit) {
    if (!limit || this.layerData.length <= limit) {
      return this;
    }
    // sort by column
    const sortedLayerDarta = this.layerData.sort((a, b) => {
      const ENTRY_VALUE_INDEX = 1;

      if (a[ENTRY_VALUE_INDEX] < b[ENTRY_VALUE_INDEX]) {
        return -1;
      } else if (a[ENTRY_VALUE_INDEX] > b[ENTRY_VALUE_INDEX]) {
        return 1;
      } else {
        return 0;
      }
    });

    const sliceToInclude = sortedLayerDarta.slice(0, limit - 1);
    const sliceToExclude = sortedLayerDarta.slice(limit - 1);

    let total = sortedLayerDarta.reduce((acc, [, value]) => {
      if (typeof value === 'number') {
        acc = acc + value;
      }
      return acc;
    }, 0);

    total = Math.max(total, 0.01);

    const groupedOtherValues = sliceToExclude.reduce((acc, [, value]) => {
      if (typeof value === 'number') {
        acc = acc + value;
      }
      return acc;
    }, 0);

    this.layerData = [...sliceToInclude, ['Other', groupedOtherValues]];

    return this;
  }

  handleNonOverlapDifference() {
    const total = this.data.total_area;
    const sumOfValues = this.getSumOfValues();

    const nonOverlapValue = total - sumOfValues;
    this.layerData.push(['Non-Overlap', nonOverlapValue]);

    return this;
  }

  handleRowPercentageAndFormat() {
    const total = Math.max(this.data.total_area, 0.01);

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

/**
 *  —— R E F A C T O R ——
 */
const parseArgentinaLayer = (operation, data, dataRow, csvData) => {
  const { attribute, limit, label } = operation;

  // parse property from the data source
  const layer = new ArgentinaLayerUtil(attribute, data);

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
      if (type === 'category') {
        parseArgentinaLayer(composite, data, dataRow, csvData);
      }
    });
  }
  return csvData;
};

export { argentinaLayers };
