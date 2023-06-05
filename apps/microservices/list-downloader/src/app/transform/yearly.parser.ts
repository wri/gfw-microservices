import { sum } from 'lodash';
import { cloneRow, formatPct, validatePct } from '../shared/functions';

const yearlyParser = (operation, dataRow, data, csvData) => {
  operation.composites.forEach((field) => {
    const yearlyData = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};

    let totalListLevelCount = 0;

    const nestedJSONAttributes = [
      'tree_cover_loss_brazil_biomes_yearly',
      'tree_cover_loss_sea_landcover_yearly',
      'tree_cover_loss_idn_landcover_yearly',
    ]; //'commodity_mill_priority_level'

    if (nestedJSONAttributes.indexOf(field.attribute) === -1) {
      if (!yearlyData.forEach) {
        Object.keys(yearlyData).forEach((year) => {
          totalListLevelCount += yearlyData[year];
        });
      }
    }

    const totalStat = field.following
      ? field.following
      : operation.following.find((stat) => {
          return stat.parsed === 'total';
        });

    let totalStatValue = 0;
    if (totalStat && totalStat.attribute) {
      let totalAttr = data[totalStat.attribute];

      if (totalAttr && typeof totalAttr === 'string') {
        totalAttr = JSON.parse(totalAttr);
        if (totalAttr.forEach) {
          totalStatValue = 0;
          totalAttr.forEach((attr) => {
            totalStatValue += attr;
          });
        } else {
          Object.keys(totalAttr).forEach((attr) => {
            const yearData = totalAttr[attr];
            if (typeof yearData === 'number') {
              totalStatValue += yearData;
            } else if (typeof yearData === 'object') {
              Object.keys(totalAttr).forEach((innerAttr) => {
                if (typeof totalAttr[innerAttr] === 'object') {
                  Object.keys(totalAttr[innerAttr]).forEach((biomeYear) => {
                    totalStatValue += totalAttr[innerAttr][biomeYear];
                  });
                }
              });
            }
          });
        }
      }
    }

    let rowValue = 0;

    if (field.attribute === 'tree_cover_loss_brazil_biomes_yearly') {
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
            const percent = formatPct(validatePct((total / totalSubCategory) * 100));
            currentRow.push(percent);
          }

          if (
            totalSubCategory > 0 &&
            (data.south_america_presence === true || data.south_america_presence === 'true') &&
            data.Country === 'Brazil'
          ) {
            csvData.push(currentRow);
          }
        });
      });
    } else if (field.attribute === 'commodity_mill_priority_level') {
      Object.keys(yearlyData).forEach((year) => {
        //TODO remove this if statement once we have data for 2021
        if (parseInt(year, 10) < 2021) {
          const currentRow = cloneRow(dataRow);
          rowValue = yearlyData[year];
          if (field.label) {
            currentRow.push(field.label);
          }

          if (rowValue === 0) {
            currentRow.push('Low');
          } else if (rowValue === 1) {
            currentRow.push('Medium');
          } else {
            currentRow.push('High');
          }

          currentRow.push(year);

          csvData.push(currentRow);
        }
      });
    } else {
      Object.keys(yearlyData).forEach((year) => {
        const currentRow = cloneRow(dataRow);

        if (isNaN(parseInt(year)) === true) {
          const focusedData = yearlyData[year];

          totalListLevelCount = 0;

          Object.keys(focusedData).forEach((focusedYear) => {
            const val = focusedData[focusedYear];
            totalListLevelCount += val;
          });

          Object.keys(focusedData).forEach((focusedYear) => {
            const nestedRow = cloneRow(currentRow);
            const val = focusedData[focusedYear];

            nestedRow.push(`${field.label} - ${year}`);
            nestedRow.push(val);
            nestedRow.push(focusedYear);

            if (totalStat) {
              nestedRow.push(totalListLevelCount);
              const percent = formatPct(validatePct((val / totalStatValue) * 100));
              nestedRow.push(percent);
            }

            csvData.push(nestedRow);
          });
        } else {
          let totalSubCategory = 0;
          Object.keys(yearlyData).forEach((yr) => {
            totalSubCategory += yearlyData[yr];
          });

          rowValue = yearlyData[year];

          if (totalSubCategory > 0) {
            if (field.label) {
              currentRow.push(field.label);
            }

            currentRow.push(rowValue);
            currentRow.push(year);

            if (totalStat) {
              currentRow.push(totalStatValue);

              const percent = formatPct(validatePct((rowValue / totalStatValue) * 100));
              currentRow.push(percent);
            }

            csvData.push(currentRow);
          } else {
            currentRow.push(year);
            currentRow.push(0);
            csvData.push(currentRow);
          }
        }
      });
    }
  });
};

export { yearlyParser };
