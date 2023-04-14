import {
  cloneRow,
  formatPct,
  validatePct,
  parseListData,
} from '../shared/functions';

const overheadParser = (
  operation,
  dataRow,
  data,
  csvData,
  listLevelAnalysis
) => {
  if (operation.name === 'list_name') {
    const { list_name } = data;
    dataRow.push(list_name ?? '');
  } else if (operation.name === 'Location Name') {
    if (data['Investment Name']) {
      if (data['Investment Name'].indexOf(',') > -1) {
        dataRow.push('"' + data['Investment Name'] + '"');
      } else {
        dataRow.push(data['Investment Name']);
      }
    } else {
      if (data['Location Name'].indexOf(',') > -1) {
        dataRow.push('"' + data['Location Name'] + '"');
      } else {
        dataRow.push(data['Location Name']);
      }
    }
  } else if (operation.name === 'data_layer') {
    const argentinaOTBN = JSON.parse(data.arg_otbn_area);
    const brazilBiomes = JSON.parse(data.brazil_biomes);

    if (Object.entries(argentinaOTBN).length > 0) {
      let total = 0;
      Object.keys(argentinaOTBN).forEach((layer) => {
        total += argentinaOTBN[layer];
      });

      Object.keys(argentinaOTBN).forEach((category) => {
        const currentRow = cloneRow(dataRow);
        currentRow.push('Argentina OTBN');
        currentRow.push(category);
        const overlapPercent = formatPct(
          validatePct((argentinaOTBN[category] / total) * 100)
        );
        currentRow.push(overlapPercent);

        csvData.push(currentRow);
      });
    } else if (Object.entries(brazilBiomes).length > 0) {
      let total = 0;
      Object.keys(brazilBiomes).forEach((layer) => {
        total += brazilBiomes[layer];
      });

      Object.keys(brazilBiomes).forEach((category) => {
        const currentRow = cloneRow(dataRow);
        currentRow.push('Brazil Biomes');
        currentRow.push(category);
        const overlapPercent = formatPct(
          validatePct((brazilBiomes[category] / total) * 100)
        );
        currentRow.push(overlapPercent);

        csvData.push(currentRow);
      });
    }
  } else if (operation.name === 'brazil_biomes') {
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
  } else if (operation.name === 'seAsia_overlap') {
    operation.composites.forEach((field) => {
      const totalStatValue = parseListData(field.attribute, [
        listLevelAnalysis,
      ]);
      const currentRow = cloneRow(dataRow);

      if (totalStatValue > 0) {
        const yearlyData = data[field.attribute]
          ? JSON.parse(data[field.attribute])
          : {};

        if (isNaN(parseInt(yearlyData)) === true) {
          let totalStatV = 0;

          Object.keys(yearlyData).forEach((locationName) => {
            totalStatV += yearlyData[locationName];
          });

          Object.keys(yearlyData).forEach((locationName) => {
            const nestedRow = cloneRow(currentRow);
            nestedRow.push(field.label);
            nestedRow.push(locationName);
            const percent = formatPct(
              validatePct((yearlyData[locationName] / totalStatV) * 100)
            );
            nestedRow.push(percent);
            if (totalStatV > 0) {
              csvData.push(nestedRow);
            }
          });
        } else {
          const currentRowIn = cloneRow(dataRow);
          currentRowIn.push(field.label);
          currentRowIn.push('Within Forest Moratorium');
          const percentIn = formatPct(
            validatePct((yearlyData / data.total_area) * 100)
          );
          currentRowIn.push(percentIn);
          csvData.push(currentRowIn);

          const hectaresOut = data.total_area - yearlyData;
          const currentRowOut = cloneRow(dataRow);
          currentRowOut.push(field.label);
          currentRowOut.push('Outside Forest Moratorium');
          const percentOut = formatPct(
            validatePct((hectaresOut / data.total_area) * 100)
          );
          currentRowOut.push(percentOut);
          csvData.push(currentRowOut);
        }
      }
    });
  } else if (operation.name === 'soy') {
    const soyTotalArea = JSON.parse(data.soy_total_area);
    let totalSoy = 0;

    Object.keys(soyTotalArea).forEach((year) => {
      totalSoy += soyTotalArea[year];
    });
    const currentRow = cloneRow(dataRow);
    const soyPercent = formatPct(
      validatePct((totalSoy / data.total_area) * 100)
    );
    currentRow.push(soyPercent);
    currentRow.push(totalSoy);

    const totalPre2001 = data.soy_pre2001_nonforest_area;
    const pre2001Percent = formatPct(
      validatePct((totalPre2001 / data.total_area) * 100)
    );
    currentRow.push(pre2001Percent);
    currentRow.push(totalPre2001);
    csvData.push(currentRow);
  } else if (operation.name === 'palmRiskAnalysis') {
    const currentRow = cloneRow(dataRow);
    operation.fields.forEach((field) => {
      if (field.type === 'yearly') {
        const totalProp = data[field.attribute]
          ? JSON.parse(data[field.attribute])
          : {};

        let val = 0;
        Object.keys(totalProp).forEach((year, j) => {
          val += totalProp[year];
        });

        if (field.parsed === 'category') {
          const lastYear =
            totalProp[
              Object.keys(totalProp)[Object.keys(totalProp).length - 1]
            ];
          let label;
          if (lastYear === 0) {
            label = 'Low';
          } else if (lastYear === 1) {
            label = 'Medium';
          } else {
            label = 'High';
          }

          currentRow.push(label);
        } else if (field.parsed === 'aggregate') {
          currentRow.push(val);
        } else if (field.parsed === 'last') {
          const years = Object.keys(totalProp);
          if (years && years.length > 0) {
            currentRow.push(totalProp[years[years.length - 1]]);
          } else {
            currentRow.push('');
          }
        }
      } else if (field.type === 'lastYear') {
        const rowValue = data[field.attribute];
        const rowObj = JSON.parse(rowValue);
        // const value = rowValue ? getLastValue(rowValue) : 0;

        const years = Object.keys(rowObj);
        const value = rowObj[years[years.length - 1]];

        const priority = value === 0 ? 'Low' : value === 1 ? 'Medium' : 'High';
        currentRow.push(priority);
      }
    });

    csvData.push(currentRow);
  } else if (
    operation.name === 'forestChangeDiagnosticLocationSummary' ||
    operation.name === 'commodityRiskDiagnosticLocationSummary'
  ) {
    const currentRow = cloneRow(dataRow);
    currentRow.push(data.State);
    currentRow.push(data.Country);
    const totalArea = data.total_area;

    operation.fields.forEach((field) => {
      const fieldValue = data[field.attribute]
        ? JSON.parse(data[field.attribute])
        : 0;

      if (field.parsed === 'percent') {
        const percent = formatPct(validatePct((fieldValue / totalArea) * 100));
        currentRow.push(percent);
      } else if (field.parsed === 'aggregate') {
        currentRow.push(fieldValue.toFixed(2));
      }
    });

    operation.additionalFields.forEach((field) => {
      switch (typeof data[field.attribute]) {
        case 'number':
          currentRow.push(data[field.attribute]);
          break;
        case 'string':
          currentRow.push(data[field.attribute]);
          break;
        case 'object':
          // eslint-disable-next-line no-case-declarations
          const fieldValue = data[field.attribute]
            ? JSON.parse(data[field.attribute])
            : 0;
          if (fieldValue && field.parsed === 'percent') {
            const percent = formatPct(
              validatePct((fieldValue / totalArea) * 100)
            );
            currentRow.push(percent);
          } else if (fieldValue && field.parsed === 'aggregate') {
            currentRow.push(fieldValue.toFixed(2));
          } else {
            currentRow.push('');
          }
          break;
        default:
          //undefined
          currentRow.push('');
      }
    });

    csvData.push(currentRow);
  } else if (operation.name === 'pie_chart') {
    operation.composites.forEach((field) => {
      const categoryData = data[field.attribute]
        ? JSON.parse(data[field.attribute])
        : {};

      let rowValue = 0;
      Object.keys(categoryData).forEach((category) => {
        const yearlyData = categoryData[category];
        Object.keys(yearlyData).forEach((year) => {
          rowValue += yearlyData[year];
        });
      });

      Object.keys(categoryData).forEach((category) => {
        const categoryValues = categoryData[category];
        const currentRow = cloneRow(dataRow);
        let categoryCount = 0;

        Object.keys(categoryValues).forEach((year) => {
          categoryCount += categoryValues[year];
        });

        if (field.label) {
          currentRow.push(field.label);
        }
        currentRow.push(category);

        let layerPercent = formatPct(
          validatePct((categoryCount / rowValue) * 100)
        );
        if (!categoryCount || !rowValue) {
          layerPercent = '0';
        }
        currentRow.push(layerPercent);

        csvData.push(currentRow);
      });
    });
  }
};

export { overheadParser };
