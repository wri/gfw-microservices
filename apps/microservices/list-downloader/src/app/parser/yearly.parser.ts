import { NESTED_JSON_ATTRIBUTES } from '../shared/constants';
import { cloneRow, formatPct, validatePct } from '../shared/functions';
import { commodityMillPriorityLevelYearly } from './mill.priority.parser';
import { brazilBiomesYearlyTCLParser } from './south.america.parser';

const yearlyParser = ({ operation, data, dataRow, csvData }) => {
  const { composites, following } = operation;
  composites?.forEach((field) => {
    const yearlyData = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};

    let totalListLevelCount = 0;

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
          totalStatValue = totalAttr.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          );
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
