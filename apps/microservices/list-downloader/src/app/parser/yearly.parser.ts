import { NESTED_JSON_ATTRIBUTES } from '../shared/constants';
import { cloneRow, formatPct, validatePct, filterProdesYearlyData } from '../shared/functions';
import { commodityMillPriorityLevelYearly } from './mill.priority.parser';
import { brazilBiomesYearlyTCLParser } from './south.america.parser';
import { DIAGNOSTIC_ANALYSIS_PERIOD } from '@wri-monorepos/constants';

const yearlyParser = ({ operation, data, dataRow, csvData }) => {
  const { composites, following } = operation;
  composites?.forEach((field) => {
    let yearlyData = {};

    if (field.attribute === 'tree_cover_loss_prodes_wdpa_yearly') {
      const braWdpaRaw = JSON.parse(data.country_specific_deforestation_wdpa_yearly || '{}')?.BRA;

      if (braWdpaRaw && typeof braWdpaRaw === 'object') {
        // Check if BRA is directly year-keyed (e.g., { 2018: 10, 2019: 20 })
        // or category-keyed (e.g., { "Category I": { 2018: 10, 2019: 20 } })
        const firstKey = Object.keys(braWdpaRaw)[0];
        const isYearKeyed =
          firstKey && (/^\d{4}$/.test(firstKey) || typeof braWdpaRaw[firstKey] === 'number');

        if (isYearKeyed) {
          // Direct year-keyed structure: { 2018: 10, 2019: 20 }
          Object.entries(braWdpaRaw).forEach(([year, val]) => {
            yearlyData[year] = val;
          });
        } else {
          // Category-keyed structure: { "Category I": { 2018: 10, 2019: 20 }, ... }
          Object.values(braWdpaRaw).forEach((category) => {
            Object.entries(category || {}).forEach(([year, val]) => {
              yearlyData[year] = (yearlyData[year] || 0) + (val || 0);
            });
          });
        }
      } else {
        // Fallback to legacy attribute
        yearlyData = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};
      }
    } else {
      yearlyData = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};
    }

    let totalListLevelCount = 0;

    if (field.attribute === 'tree_cover_loss_soy_yearly') {
      Object.keys(yearlyData).forEach((year) => {
        if (parseInt(year, 10) > DIAGNOSTIC_ANALYSIS_PERIOD.END_YEAR_SOY_PLANTED) {
          delete yearlyData[year];
        }
      });
    }

    if (
      field.attribute === 'tree_cover_loss_prodes_yearly' ||
      field.attribute === 'tree_cover_loss_prodes_wdpa_yearly'
    ) {
      yearlyData = filterProdesYearlyData(yearlyData, DIAGNOSTIC_ANALYSIS_PERIOD);
    }

    if (NESTED_JSON_ATTRIBUTES.indexOf(field.attribute) === -1) {
      if (typeof yearlyData === 'object') {
        Object.keys(yearlyData).forEach((year) => {
          totalListLevelCount += yearlyData[year];
        });
      }
    }

    const totalStat = field.following ?? following?.find((stat) => stat.parsed === 'total');

    let totalStatValue = 0;
    if (totalStat && totalStat.attribute) {
      let totalAttr = data[totalStat.attribute];

      if (totalAttr && typeof totalAttr === 'string') {
        totalAttr = JSON.parse(totalAttr);

        if (Array.isArray(totalAttr)) {
          // Forma A: array de números por ano
          totalStatValue = totalAttr.reduce((acc, v) => acc + (Number(v) || 0), 0);
        } else if (totalAttr && typeof totalAttr === 'object') {
          Object.values(totalAttr).forEach((yearData) => {
            if (typeof yearData === 'number') {
              // Forma B (plana): { "Category II": 4629.17, "Category III": 0.42 }
              totalStatValue += yearData;
            } else if (yearData && typeof yearData === 'object') {
              // Forma C (aninhada): { "Cerrado": { 2018: 10, 2019: 5 }, ... }
              Object.values(yearData).forEach((v) => {
                totalStatValue += Number(v) || 0;
              });
            }
          });
        }
      }
    }

    let rowValue = 0;
    if (field.attribute === ' ' && data.Country === 'Brazil') {
      brazilBiomesYearlyTCLParser({
        field,
        yearlyData,
        totalStat,
        dataRow,
        csvData,
      });
    } else if (field.attribute === 'commodity_mill_priority_level') {
      commodityMillPriorityLevelYearly({
        yearlyData,
        field,
        dataRow,
        csvData,
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
          rowValue = yearlyData[year] || 0;

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
        }
      });
    }
  });
};

export { yearlyParser };
