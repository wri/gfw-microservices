import { sum } from 'lodash';
import { DATA_LAYER } from '../shared/constants';
import { cloneRow, formatPct, validatePct, isObjInCountryFormat } from '../shared/functions';

const dataLayerParser = ({ data, dataRow, csvData }) => {
  const { brazil_biomes: brazilBiomes, classified_region_area: classifiedRegionArea } = data;

  // Try Brazil biomes first
  const brazilParsed = JSON.parse(brazilBiomes ?? '{}');
  if (Object.keys(brazilParsed).length > 0) {
    dataLayerProcessor(
      { dataLayerName: DATA_LAYER.brazil_biomes, data: brazilParsed },
      dataRow,
      csvData
    );
    return;
  }

  // Fallback to Argentina classified region (replaces deprecated arg_otbn_area)
  if (classifiedRegionArea) {
    try {
      const parsedClassifiedRegion = JSON.parse(classifiedRegionArea ?? '{}');
      const argData = isObjInCountryFormat(parsedClassifiedRegion)
        ? parsedClassifiedRegion?.ARG || {}
        : parsedClassifiedRegion;
      if (Object.keys(argData).length > 0) {
        dataLayerProcessor(
          { dataLayerName: 'Argentina Classified Region', data: argData },
          dataRow,
          csvData
        );
        return;
      }
    } catch (e) {
      // If parsing fails, do nothing
    }
  }
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

    const overlapPercent = formatPct(validatePct((data[location] / total) * 100));
    currentRow.push(overlapPercent);

    csvData.push(currentRow);
  });
};

const brazilBiomesYearlyTCLParser = ({ field, yearlyData, totalStat, dataRow, csvData }) => {
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
        const percent = formatPct(validatePct((total / totalSubCategory) * 100));
        currentRow.push(percent);
      }

      if (totalSubCategory > 0) {
        csvData.push(currentRow);
      }
    });
  });
};

export { dataLayerParser, brazilBiomesYearlyTCLParser };
