import  { duplicateRow, formatPct, validatePct, parseListData } from './functions'
import { Transform } from 'stream';
import _sum from 'lodash/sum';

import { TemplateOperation } from './model';

class GetLastValue extends Transform {

  constructor(private fields: string[]) {
    super({objectMode: true});
  }

  _transform(chunk, _, next) {
    console.log(chunk)
    console.log(this.fields)

    let result = { ...chunk }
    this.fields.forEach(field => {
      const value = JSON.parse(result[field])
        if(typeof value != 'number'){

          const key = Object.entries(value).filter(([, value]) => value > 0).map(([key]) => parseFloat(key)).reduce((a, b) => Math.max(a, b), -Infinity);
          result = {
            ...result,
            [field]: value[key] ?? ''
          }
      }
    });
    console.log(result)
    next(null, result);

  }
}

class ManipulateDataForDashboard extends Transform {
  constructor(private templateOperations: TemplateOperation,private table: string) {
    super({objectMode: true});
  }

  _transform(data, _, next) {
    const rowsToReturn = [];
    const dataRow = [];
    this.templateOperations.forEach((operation) => {
      if (operation.parsed === 'overhead') {
        if (operation.name === 'list_name') {
          const { list_name } = data;
          dataRow.push(  list_name ??  '');
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
        } else if (operation.name === 'brazil_biomes') {
          const brazilBiomeLocations = JSON.parse(data.brazil_biomes);

          let total = 0;
          Object.keys(brazilBiomeLocations).forEach((biome) => {
            total += brazilBiomeLocations[biome];
          });

          Object.keys(brazilBiomeLocations).forEach((location) => {
            const currentRow = duplicateRow(dataRow);
            currentRow.push(location);

            const overlapPercent = formatPct(validatePct((brazilBiomeLocations[location] / total) * 100));
            currentRow.push(overlapPercent);

            rowsToReturn.push(currentRow);
          });
        } else if (operation.name === 'seAsia_overlap') {
          operation.composites.forEach((field) => {
            const totalStatValue = parseListData(field.attribute, data);
            const currentRow = duplicateRow(dataRow);

            if (totalStatValue > 0) {
              const yearlyData = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};

              if (isNaN(parseInt(yearlyData)) === true) {
                let totalStatV = 0;

                Object.keys(yearlyData).forEach((locationName) => {
                  totalStatV += yearlyData[locationName];
                });

                Object.keys(yearlyData).forEach((locationName) => {
                  const nestedRow = duplicateRow(currentRow);
                  nestedRow.push(field.label);
                  nestedRow.push(locationName);
                  const percent = formatPct(validatePct((yearlyData[locationName] / totalStatV) * 100));
                  nestedRow.push(percent);
                  if (totalStatV > 0) {
                    rowsToReturn.push(nestedRow);
                  }
                });
              } else {
                const currentRowIn = duplicateRow(dataRow);
                currentRowIn.push(field.label);
                currentRowIn.push('Within Forest Moratorium');
                const percentIn = formatPct(validatePct((yearlyData / data.total_area) * 100));
                currentRowIn.push(percentIn);
                rowsToReturn.push(currentRowIn);

                const hectaresOut = data.total_area - yearlyData;
                const currentRowOut = duplicateRow(dataRow);
                currentRowOut.push(field.label);
                currentRowOut.push('Outside Forest Moratorium');
                const percentOut = formatPct(validatePct((hectaresOut / data.total_area) * 100));
                currentRowOut.push(percentOut);
                rowsToReturn.push(currentRowOut);
              }
            }
          });
        } else if (operation.name === 'soy') {
          const soyTotalArea = JSON.parse(data.soy_total_area);
          let totalSoy = 0;

          Object.keys(soyTotalArea).forEach((year) => {
            totalSoy += soyTotalArea[year];
          });
          const currentRow = duplicateRow(dataRow);
          const soyPercent = formatPct(validatePct((totalSoy / data.total_area) * 100));
          currentRow.push(soyPercent);
          currentRow.push(totalSoy);

          const totalPre2001 = data.soy_pre2001_nonforest_area;
          const pre2001Percent = formatPct(validatePct((totalPre2001 / data.total_area) * 100));
          currentRow.push(pre2001Percent);
          currentRow.push(totalPre2001);
          rowsToReturn.push(currentRow);
        } else if (operation.name === 'palmRiskAnalysis') {
          const currentRow = duplicateRow(dataRow);
          operation.fields.forEach((field) => {
            if (field.type === 'yearly') {
              const totalProp = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};

              let val = 0;
              Object.keys(totalProp).forEach((year, j) => {
                val += totalProp[year];
              });

              if (field.parsed === 'category') {
                const lastYear = totalProp[Object.keys(totalProp)[Object.keys(totalProp).length - 1]];
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

          rowsToReturn.push(currentRow);
        } else if (
          operation.name === 'forestChangeDiagnosticLocationSummary' ||
          operation.name === 'commodityRiskDiagnosticLocationSummary'
        ) {
          const currentRow = duplicateRow(dataRow);
          currentRow.push(data.State);
          currentRow.push(data.Country);
          const totalArea = data.total_area;

          operation.fields.forEach((field) => {
            const fieldValue = data[field.attribute] ? JSON.parse(data[field.attribute]) : 0;

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
                const fieldValue = data[field.attribute] ? JSON.parse(data[field.attribute]) : 0;
                if (fieldValue && field.parsed === 'percent') {
                  const percent = formatPct(validatePct((fieldValue / totalArea) * 100));
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

          next(null, currentRow);
        } else if (operation.name === 'pie_chart') {
          operation.composites.forEach((field) => {
            const categoryData = data[field.attribute] ? JSON.parse(data[field.attribute]) : {};

            let rowValue = 0;
            Object.keys(categoryData).forEach((category) => {
              const yearlyData = categoryData[category];
              Object.keys(yearlyData).forEach((year) => {
                rowValue += yearlyData[year];
              });
            });

            Object.keys(categoryData).forEach((category) => {
              const categoryValues = categoryData[category];
              const currentRow = duplicateRow(dataRow);
              let categoryCount = 0;

              Object.keys(categoryValues).forEach((year) => {
                categoryCount += categoryValues[year];
              });

              if (field.label) {
                currentRow.push(field.label);
              }
              currentRow.push(category);

              let layerPercent = formatPct(validatePct((categoryCount / rowValue) * 100));
              if (!categoryCount || !rowValue) {
                layerPercent = 0;
              }
              currentRow.push(layerPercent);

              rowsToReturn.push(currentRow);
            });
          });
        }
      } else if (operation.parsed === 'total') {
        let total = 0;
        if (data[operation.name]) {
          const yearlyData = JSON.parse(data[operation.name]);

          if (yearlyData.forEach) {
            yearlyData.forEach((year) => {
              total += year.result;
            });
          } else if (typeof yearlyData === 'number') {
            total += yearlyData;
          } else {
            Object.keys(yearlyData).forEach((year) => {
              total += yearlyData[year];
            });
          }
        } else {
          total = 0;
        }
        dataRow.push(total);
      } else if (operation.parsed === 'yearly') {
        operation.composites.forEach((field, index) => {
          let locationHasData = true;

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

              if (totalListLevelCount === 0) {
                locationHasData = false;
              }
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
              totalSubCategoryValues[biome] = _sum(Object.values(yearlyData[biome]));
            });

            biomes.forEach((biomeName, biomeIndex) => {
              const biomeYears = yearlyData[biomeName];
              Object.keys(biomeYears).forEach((year) => {
                const total = biomeYears[year];
                const label = `${field.label} - ${biomes[biomeIndex]}`;

                const currentRow = duplicateRow(dataRow);
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
                  rowsToReturn.push(currentRow);
                }
              });
            });
          } else if (field.attribute === 'commodity_mill_priority_level') {
            Object.keys(yearlyData).forEach((year) => {
              const currentRow = duplicateRow(dataRow);
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

              rowsToReturn.push(currentRow);
            });
          } else {
            Object.keys(yearlyData).forEach((year) => {
              const currentRow = duplicateRow(dataRow);

              if (isNaN(parseInt(year)) === true) {
                const focusedData = yearlyData[year];

                totalListLevelCount = 0;

                Object.keys(focusedData).forEach((focusedYear) => {
                  const val = focusedData[focusedYear];
                  totalListLevelCount += val;
                });

                Object.keys(focusedData).forEach((focusedYear) => {
                  const nestedRow = duplicateRow(currentRow);
                  const val = focusedData[focusedYear];

                  nestedRow.push(`${field.label} - ${year}`);
                  nestedRow.push(val);
                  nestedRow.push(focusedYear);

                  if (totalStat) {
                    nestedRow.push(totalListLevelCount);
                    const percent = formatPct(validatePct((val / totalStatValue) * 100));
                    nestedRow.push(percent);
                  }

                  locationHasData = totalListLevelCount > 0;

                  if (
                    locationHasData &&
                    this.table.indexOf('sAmerica') > -1 &&
                    (data.south_america_presence === true || data.south_america_presence === 'true')
                  ) {
                    rowsToReturn.push(nestedRow);
                  } else if (
                    locationHasData &&
                    this.table.indexOf('seAsia') > -1 &&
                    (data.southeast_asia_presence === true || data.southeast_asia_presence === 'true')
                  ) {
                    rowsToReturn.push(nestedRow);
                  } else if (locationHasData && this.table.indexOf('sAmerica') === -1 && this.table.indexOf('seAsia') === -1) {
                    rowsToReturn.push(nestedRow);
                  }
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

                  if (
                    locationHasData &&
                    this.table.indexOf('sAmerica') > -1 &&
                    (data.south_america_presence === true || data.south_america_presence === 'true')
                  ) {
                    rowsToReturn.push(currentRow);
                  } else if (
                    locationHasData &&
                    this.table.indexOf('seAsia') > -1 &&
                    (data.southeast_asia_presence === true || data.southeast_asia_presence === 'true')
                  ) {
                    rowsToReturn.push(currentRow);
                  } else if (locationHasData && this.table.indexOf('sAmerica') === -1 && this.table.indexOf('seAsia') === -1) {
                    rowsToReturn.push(currentRow);
                  }
                }
              }
            });
          }
        });
      } else if (operation.parsed === 'percent') {
        operation.numerators.forEach((field) => {
          const currentRow = duplicateRow(dataRow);

          let tclOnAttribute = 0;
          if (data[field.tclAttribute]) {
            const yearlyData = JSON.parse(data[field.tclAttribute]);

            if (yearlyData.forEach) {
              yearlyData.forEach((year) => {
                tclOnAttribute += year.result;
              });
            } else if (typeof yearlyData === 'number') {
              tclOnAttribute += yearlyData;
            } else {
              Object.keys(yearlyData).forEach((year) => {
                tclOnAttribute += yearlyData[year];
              });
            }
          }
          const attributeExtent = data[field.extentAttribute];

          const percent = formatPct(validatePct((tclOnAttribute / attributeExtent) * 100));

          if (field.label) {
            currentRow.push(field.label);
          }
          currentRow.push(percent);
          currentRow.push(tclOnAttribute);
          currentRow.push(attributeExtent);

          rowsToReturn.push(currentRow);
        });
      }
    });

    const result =[
      ...rowsToReturn,
      dataRow
    ]

    next(null, result);
  }
}

export {
  GetLastValue,
  ManipulateDataForDashboard
}
