const calculatePercentage = (operation, data, values) => {
  const { attribute } = operation;

  let total = data.total_area;

  //landmark_by_category_area uses total_area to calculate the percentage,
  //rather than the sum of all attribute values
  if (attribute !== 'landmark_by_category_area') {
    total = values.reduce((acc, [, value]) => {
      if (typeof value === 'number') {
        acc = acc + value;
      }
      return acc;
    }, 0);
  }

  total = Math.max(total, 0.01);

  const dataArray = values.map(([key, value]) => {
    let percent = 0;
    if (typeof value === 'number') {
      percent = (value / total) * 100;
    }

    const newKey = key === 'Not Reported' ? '' : key;

    return {
      key: newKey,
      value,
      percent,
    };
  });

  return dataArray.sort(({ value: valueA }, { value: valueB }) => {
    if (valueA < valueB) {
      return 1;
    } else if (valueA > valueB) {
      return -1;
    }
    return 0;
  });
};

const addOtherCategoryData = (sortedCategory, limit) => {
  if (limit === undefined || sortedCategory.length <= limit) {
    return sortedCategory;
  }

  const firstPart = sortedCategory.slice(0, limit - 1);
  const secondPart = sortedCategory.slice(limit - 1);

  let total = sortedCategory.reduce((acc, { value }) => {
    if (typeof value === 'number') {
      acc = acc + value;
    }
    return acc;
  }, 0);

  total = Math.max(total, 0.01);

  const otherValue = secondPart.reduce((acc, { value }) => {
    return acc + value;
  }, 0);

  firstPart.push({
    key: 'Other',
    value: otherValue,
    percent: (otherValue / total) * 100,
  });

  return firstPart;
};

const argentinaCategoryData = (operation, data, dataRow, csvData) => {
  const { attribute, limit, label } = operation;
  const strCategoryData = data[attribute];
  const categoryData = JSON.parse(strCategoryData || '{}');
  const values = Object.entries(categoryData);
  const sortedCategory = calculatePercentage(operation, data, values);
  const addOtherCategory = addOtherCategoryData(sortedCategory, limit);
  addOtherCategory.forEach((element) => {
    const values = Object.values(element);
    csvData.push([...dataRow, label, ...values]);
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
        argentinaCategoryData(composite, data, dataRow, csvData);
      }
    });
  }
};

export { argentinaLayers };
