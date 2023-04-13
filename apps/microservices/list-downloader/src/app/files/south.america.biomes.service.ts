import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { formatPct, validatePct } from '../shared/functions';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class SouthAmericaBiomesService extends DashboardHandleDownload {
  private existSouthLocation = false;

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'southAmericaOverlap' || type == 'everything')
    ) {
      super.start(filters, 'sAmericaBiomes', 'south_america_overlap');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'southAmericaOverlap' || type == 'everything')
    ) {
      const locations = data.filter(
        (location) => location.south_america_presence === 'true'
      );
      if (locations && locations.length > 0) {
        this.existSouthLocation = true;
        super.process(locations, filters);
      }
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis: any) {
    const csvData = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);
    console.log(EXCEL_TEMPLATES[table])

    EXCEL_TEMPLATES[table].forEach((key) => {
      const biomesObj = JSON.parse(listLevelAnalysis[key.name]);

      let total = 0;
      Object.keys(biomesObj).forEach((biome) => {
        total += biomesObj[biome];
      });

      Object.keys(biomesObj).forEach((biome) => {
        const dataRow = [list_name, biome];
        const overlapPercent = formatPct(
          validatePct((biomesObj[biome] / total) * 100)
        );
        dataRow.push(overlapPercent);
        csvData.push(dataRow);
      });
    });
    return csvData;
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('South America Biomes Finish');
    const { listView, selectedLocationsList, type } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
      this.existSouthLocation &&
      (type == 'southAmericaOverlap' || type == 'everything')
    ) {
      generateCSV(
        filters,
        'sAmericaBiomesAggregate',
        'south_america_overlap_aggregate',
        this.generateAggregate
      );
    }
    this.existSouthLocation = false;
  }
}
