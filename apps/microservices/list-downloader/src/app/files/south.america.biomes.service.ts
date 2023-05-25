import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { formatPct, validatePct } from '../shared/functions';
import {
  DATA_LAYER,
  EXCEL_TEMPLATES,
  EXCEL_TEMPLATE_HEADERS,
} from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class SouthAmericaBiomesService extends DashboardHandleDownload {
  private existSouthLocation = false;

  start(filters: GenerationFileRequest) {
    if (this.isSouthAmericaBiomesFile(filters)) {
      super.start(filters, 'sAmericaBiomes', 'south_america_overlap');
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
      if (
        Object.prototype.hasOwnProperty.call(listLevelAnalysis, key.name) ===
        false
      ) {
        return;
      }

      const analysisData = JSON.parse(listLevelAnalysis[key.name]);
      const dataLayer = DATA_LAYER[key.name];

      let total = 0;
      Object.keys(analysisData).forEach((biome) => {
        total += analysisData[biome];
      });

      Object.keys(analysisData).forEach((biome) => {
        const dataRow = [list_name, dataLayer, biome];
        const overlapPercent = formatPct(
          validatePct((analysisData[biome] / total) * 100)
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
          'south_america_overlap_aggregate',
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
