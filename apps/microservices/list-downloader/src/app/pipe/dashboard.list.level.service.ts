import * as fs from 'fs';
import { Injectable, Logger } from '@nestjs/common';

import  { duplicateRow, formatPct, validatePct, parseListData } from '../shared/functions'
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { GenerationFileRequest } from '@wri-monorepos/sql';


@Injectable()
export class DashboardListLevelService{
  private readonly logger = new Logger(DashboardListLevelService.name);

  public generateCSV(filters: GenerationFileRequest, table:string, fileSuffix: string) {
    if(filters.selectedLocationsList.length != 1){
      this.logger.log('Generate aggregate data for the following table: ', table)
      const { key, listName, listLevelAnalysis } = filters;
      const csvData = this.mountCsv(table, listName, listLevelAnalysis )
      const csvString = csvData.map((row) => row.join(',')).join('\n');
      fs.writeFileSync(`/tmp/${key}_${fileSuffix}.csv`, `${csvString}\n`);
    }
  }

  private mountCsv(table: string, list_name: string, listLevelAnalysis: any){
    const csvData = [];

    if (table === 'deforestationTrendsAggregate') {

      csvData.push(['List Name', 'Loss (thousand ha)', 'Year']);
      const deforestation = JSON.parse(listLevelAnalysis.commodity_threat_deforestation);
      Object.keys(deforestation).forEach((year) => {
        const dataRow = [list_name];
        const value = deforestation[year];
        const rounded = value.toFixed(4);
        dataRow.push(rounded);
        dataRow.push(year);

        csvData.push(dataRow);
      });
    } else if (table === 'sAmericaLossAggregate') {
      csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

      EXCEL_TEMPLATES[table].forEach((key) => {
        key.composites.forEach((field) => {
          const dataRow = [list_name];

          let rowValue = 0;
          if (!listLevelAnalysis[field.attribute]) {
            return;
          }
          const yearlyData = JSON.parse(listLevelAnalysis[field.attribute]);
          let totalSubCategory = 0;
          if (field.label !== 'Brazil Biomes') {
            Object.keys(yearlyData).forEach((yr) => {
              totalSubCategory += yearlyData[yr];
            });
          }

          Object.keys(yearlyData).forEach((year) => {
            const currentRow = duplicateRow(dataRow);
            rowValue = yearlyData[year];

            currentRow.push(field.label);

            if (field.label === 'Brazil Biomes') {
              let totalBiomeValue = 0;
              Object.keys(rowValue).forEach((biomeYearFirst) => {
                totalBiomeValue += rowValue[biomeYearFirst];
              });

              Object.keys(rowValue).forEach((biomeYear) => {
                const currentBrazilianRow = duplicateRow(dataRow);
                currentBrazilianRow.push(`Brazil Biomes - ${year}`);
                currentBrazilianRow.push(rowValue[biomeYear]);
                currentBrazilianRow.push(biomeYear);
                currentBrazilianRow.push(totalBiomeValue.toFixed(2));
                csvData.push(currentBrazilianRow);
              });
            } else {
              if (totalSubCategory > 0) {
                const nestedRow = duplicateRow(dataRow);
                nestedRow.push(field.label);
                nestedRow.push(rowValue);
                nestedRow.push(year);
                nestedRow.push(totalSubCategory.toFixed(2));
                csvData.push(nestedRow);
              }
            }
          });
        });
      });
    } else if (table === 'forestLossAggregate') {
      csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

      EXCEL_TEMPLATES[table].forEach((key) => {
        key.composites.forEach((field) => {
          const totalStatValue = parseListData(field.attribute, [listLevelAnalysis]);
          const dataRow = [list_name];

          let rowValue = 0;
          if (!listLevelAnalysis[field.attribute]) {
            return;
          }
          const yearlyData = JSON.parse(listLevelAnalysis[field.attribute]);

          Object.keys(yearlyData).forEach((year) => {
            const currentRow = duplicateRow(dataRow);
            rowValue = yearlyData[year];

            currentRow.push(field.label);

            if (field.label === 'Brazil Biomes') {
              let totalBiomeValue = 0;
              Object.keys(rowValue).forEach((biomeYearFirst) => {
                totalBiomeValue += rowValue[biomeYearFirst];
              });

              Object.keys(rowValue).forEach((biomeYear) => {
                const currentBrazilianRow = duplicateRow(dataRow);
                currentBrazilianRow.push(`Brazil Biomes - ${year}`);
                currentBrazilianRow.push(rowValue[biomeYear]);
                currentBrazilianRow.push(biomeYear);
                currentBrazilianRow.push(totalBiomeValue.toFixed(2));
                const percent = formatPct(validatePct((rowValue[biomeYear] / totalBiomeValue) * 100));
                currentRow.push(percent);
                csvData.push(currentBrazilianRow);
              });
            } else {
              currentRow.push(rowValue);
              currentRow.push(year);
              currentRow.push(totalStatValue);

              const percent = formatPct(validatePct((rowValue / totalStatValue) * 100));
              currentRow.push(percent);

              if (totalStatValue > 0) {
                csvData.push(currentRow);
              }
            }
          });
        });
      });
    } else if (table === 'seAsiaTCLAggregate') {
      csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

      EXCEL_TEMPLATES[table].forEach((key) => {
        key.composites.forEach((field) => {
          const { label, attribute } = (field  as {label: string, attribute: string});
          const totalStatValue = parseListData(attribute, [listLevelAnalysis]);
          const dataRow = [list_name];

          let rowValue = 0;
          if (!listLevelAnalysis[attribute]) {
            return;
          }
          const yearlyData = JSON.parse(listLevelAnalysis[attribute]);

          Object.keys(yearlyData).forEach((year) => {
            const currentRow = duplicateRow(dataRow);
            rowValue = yearlyData[year];

            if (isNaN(rowValue) === true) {
              let totalSubCategory = 0;
              Object.keys(rowValue).forEach((yr) => {
                totalSubCategory += rowValue[yr];
              });

              if (totalSubCategory > 0) {
                Object.keys(rowValue).forEach((location) => {
                  const nestedRow = duplicateRow(dataRow);
                  nestedRow.push(`${label} - ${year}`);
                  nestedRow.push(rowValue[location]);
                  nestedRow.push(location);
                  nestedRow.push(totalSubCategory);
                  csvData.push(nestedRow);
                });
              }
            } else {
              currentRow.push(label);
              currentRow.push(rowValue);
              currentRow.push(year);
              currentRow.push(totalStatValue);
              csvData.push(currentRow);
            }
          });
        });
      });
    } else if (table === 'sAmericaBiomesAggregate') {
      csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

      EXCEL_TEMPLATES[table].forEach((key) => {
        const biomesObj = JSON.parse(listLevelAnalysis[key.name]);

        let total = 0;
        Object.keys(biomesObj).forEach((biome) => {
          total += biomesObj[biome];
        });

        Object.keys(biomesObj).forEach((biome) => {
          const dataRow = [list_name, biome];
          const overlapPercent = formatPct(validatePct((biomesObj[biome] / total) * 100));
          dataRow.push(overlapPercent);
          csvData.push(dataRow);
        });
      });
    } else if (table === 'seAsiaOverlapAggregate') {
      csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

      EXCEL_TEMPLATES[table].forEach((key) => {
        key.composites.forEach((field) => {
          const totalStatValue = parseListData(field.attribute, [listLevelAnalysis]);
          const dataRow = [list_name];

          if (totalStatValue > 0) {
            if (!listLevelAnalysis[field.attribute]) {
              return;
            }

            const yearlyData = JSON.parse(listLevelAnalysis[field.attribute]);

            if (isNaN(parseInt(yearlyData)) === true) {
              Object.keys(yearlyData).forEach((location) => {
                const currentRow = duplicateRow(dataRow);
                currentRow.push(field.label);
                currentRow.push(location);
                const percent = formatPct(validatePct((yearlyData[location] / totalStatValue) * 100));
                currentRow.push(percent);
                csvData.push(currentRow);
              });
            } else {
              const currentRowIn = duplicateRow(dataRow);
              currentRowIn.push(field.label);
              currentRowIn.push('Within Forest Moratorium');
              const percentIn = formatPct(validatePct((yearlyData / listLevelAnalysis.total_area) * 100));
              currentRowIn.push(percentIn);
              csvData.push(currentRowIn);

              const hectaresOut = listLevelAnalysis.total_area - yearlyData;

              const currentRowOut = duplicateRow(dataRow);
              currentRowOut.push(field.label);
              currentRowOut.push('Outside Forest Moratorium');
              const percentOut = formatPct(validatePct((hectaresOut / listLevelAnalysis.total_area) * 100));
              currentRowOut.push(percentOut);
              csvData.push(currentRowOut);
            }
          }
        });
      });
    }
    return csvData;
  }
}
