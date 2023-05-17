import { sum } from 'lodash';
import { DATA_LAYER } from '../shared/constants';
import { cloneRow, formatPct, validatePct } from '../shared/functions';

const dataLayerParser = ({ data, dataRow, csvData }) => {
  const brazilData = {
    dataLayerName: DATA_LAYER.brazil_biomes,
    data: JSON.parse(data.brazil_biomes),
    available: Object.entries(JSON.parse(data.brazil_biomes)).length > 0,
  };

  const argentinaData = {
    dataLayerName: DATA_LAYER.arg_otbn_area,
    data: JSON.parse(data.arg_otbn_area),
    available: Object.entries(JSON.parse(data.arg_otbn_area)).length > 0,
  };

  const objToProcess = brazilData.available
    ? brazilData
    : argentinaData.available
    ? argentinaData
    : { data: {}, dataLayerName: '' };

  dataLayerProcessor(objToProcess, dataRow, csvData);
};

const dataLayerProcessor = ({ data, dataLayerName }, dataRow, csvData) => {
  let total = 0;
  Object.keys(data).forEach((biome) => {
    total += data[biome];
  });

  Object.keys(data).forEach((location) => {
    const currentRow = cloneRow(dataRow);
    currentRow.push(dataLayerName);
    currentRow.push(location);

    const overlapPercent = formatPct(
      validatePct((data[location] / total) * 100)
    );
    currentRow.push(overlapPercent);

    csvData.push(currentRow);
  });
};

const brazilBiomesYearlyTCLParser = ({
  field,
  yearlyData,
  totalStat,
  dataRow,
  csvData,
}) => {
  const totalSubCategoryValues = {};

  const biomes = Object.keys(yearlyData);
  biomes.forEach((biome) => {
    totalSubCategoryValues[biome] = sum(Object.values(yearlyData[biome]));
  });

  biomes.forEach((biomeName, biomeIndex) => {
    const biomeYears = yearlyData[biomeName];
    Object.keys(biomeYears).forEach((year) => {
      const total = biomeYears[year];
      const label = `${field.label ?? ''} - ${biomes[biomeIndex]}`;

      const currentRow = cloneRow(dataRow);
      currentRow.push(label);
      currentRow.push(total);
      currentRow.push(year);

      const totalSubCategory = totalSubCategoryValues[biomeName];
      if (totalStat) {
        currentRow.push(totalSubCategory);
        const percent = formatPct(
          validatePct((total / totalSubCategory) * 100)
        );
        currentRow.push(percent);
      }

      if (totalSubCategory > 0) {
        csvData.push(currentRow);
      }
    });
  });
};

export { dataLayerParser, brazilBiomesYearlyTCLParser };
