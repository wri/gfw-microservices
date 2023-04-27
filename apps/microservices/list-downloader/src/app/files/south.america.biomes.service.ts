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
    if (this.isSouthAmericaBiomesFile(filters)) {
      super.start(filters, 'sAmericaBiomes', 'south_america_brazil_biomes');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isSouthAmericaBiomesFile(filters)) {
      const locations = data.filter(
        (location) => location.south_america_presence === 'true'
      );
      if (locations && locations.length > 0) {
        this.existSouthLocation = true;
        super.process(locations, filters);
      }
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    const csvData = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

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

  async finish(filters: GenerationFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isSouthAmericaBiomesFile(filters)) {
      this.logger.log('South America Biomes Finish');
      if (selectedLocationsList.length != 1 && this.existSouthLocation) {
        generateCSV(
          filters,
          'sAmericaBiomesAggregate',
          'south_america_brazil_biomes_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
    this.existSouthLocation = false;
  }

  isSouthAmericaBiomesFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'forest_change' &&
      (type === 'southAmericaOverlap' || type === 'everything')
    );
  }
}
