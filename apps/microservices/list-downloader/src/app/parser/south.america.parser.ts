import { sum } from 'lodash';
import { cloneRow, formatPct, validatePct } from '../shared/functions';

const brazilBiomesParser = ({ data, csvData, dataRow }) => {
  const brazilBiomeLocations = JSON.parse(data.brazil_biomes);

  let total = 0;
  Object.keys(brazilBiomeLocations).forEach((biome) => {
    total += brazilBiomeLocations[biome];
  });

  Object.keys(brazilBiomeLocations).forEach((location) => {
    const currentRow = cloneRow(dataRow);
    currentRow.push(location);

    const overlapPercent = formatPct(
      validatePct((brazilBiomeLocations[location] / total) * 100)
    );
    currentRow.push(overlapPercent);

    csvData.push(currentRow);
  });
};

const brazilBiomesYearlyTCLParser = ({
  data,
  csvData,
  field,
  yearlyData,
  dataRow,
  totalStat,
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
      const label = `${field.label} - ${biomes[biomeIndex]}`;

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

      if (
        totalSubCategory > 0 &&
        (data.south_america_presence === true ||
          data.south_america_presence === 'true') &&
        data.Country === 'Brazil'
      ) {
        csvData.push(currentRow);
      }
    });
  });
};

export { brazilBiomesParser, brazilBiomesYearlyTCLParser };
