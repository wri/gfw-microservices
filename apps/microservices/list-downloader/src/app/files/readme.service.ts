import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as fs from 'fs';
import * as path from 'path';
import {
  ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER,
  DEFORESTATION_KPIS_HEADER,
  DEFORESTATION_KPIS_HEADER_AGGREGATE,
  NATURAL_FOREST_LOST_KPIS_HEADER,
  NATURAL_FOREST_LOST_KPIS_HEADER_AGGREGATE,
  OTHER_KPIS_HEADER,
  OTHER_KPIS_HEADER_AGGREGATE,
} from '../shared/constants';

type HeaderType = {
  [key: string]: {
    name: string;
    description: string;
  };
};

type ReadmeDataType = {
  header: HeaderType;
  fileName: string;
  description: string;
};

@Injectable()
export class ReadmeService {
  private readonly logger = new Logger(ReadmeService.name);

  buildReadmeData(data: Array<ReadmeDataType>): string {
    const output = ['CSV Name;Description;Column;Column Description'];
    data.map((item) => {
      const { header, fileName, description } = item;
      Object.keys(header).map((key) => {
        output.push(
          `<LISTNAME>_${fileName};${description};${header[key].name};${header[key].description}`
        );
      });
    });
    return output.join('\n');
  }

  afiReadmeData() {
    return [
      {
        header: DEFORESTATION_KPIS_HEADER_AGGREGATE,
        fileName: 'deforestation_kpis',
        description: 'Location level natural forest metrics and negligible risk calculation',
      },
      {
        header: DEFORESTATION_KPIS_HEADER,
        fileName: 'deforestation_kpis_aggregated',
        description: 'List level natural forest metrics and negligible risk calculation',
      },
      {
        header: OTHER_KPIS_HEADER_AGGREGATE,
        fileName: 'other_metrics_aggregated',
        description: 'List level metrics related to deforestation risk',
      },
      {
        header: OTHER_KPIS_HEADER,
        fileName: 'other_metrics',
        description: 'Location level metrics related to deforestation risk',
      },
      {
        header: NATURAL_FOREST_LOST_KPIS_HEADER_AGGREGATE,
        fileName: 'natural_forest_loss_aggregated',
        description: 'List level natural forest metrics',
      },
      {
        header: NATURAL_FOREST_LOST_KPIS_HEADER,
        fileName: 'natural_forest_loss',
        description: 'Location level natural forest metrics',
      },
    ] as Array<ReadmeDataType>;
  }

  alertsReadmeData(filters: AlertFieldsFileRequest) {
    const { selectedTimeframe } = filters;
    const readmeData: Array<ReadmeDataType> = [];

    if (selectedTimeframe === 'DAY') {
      readmeData.push({
        header: ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER,
        fileName: '_IntegratedAlerts_NaturalForest_Daily',
        description: 'Natural Forest Daily Alerts by Location',
      });
    }
    return readmeData;
  }

  async write(filters: BasicFieldsFileRequest): Promise<void> {
    const { type } = filters;
    const readmeBuilder = {
      afi: this.afiReadmeData,
      alerts: this.alertsReadmeData,
    };

    if (Object.prototype.hasOwnProperty.call(readmeBuilder, type)) {
      const data = readmeBuilder[type](filters);
      const readme = this.buildReadmeData(data);
      await this.writeDataToFile(filters, readme);
    }
  }

  async writeDataToFile(filters: BasicFieldsFileRequest, data: string): Promise<void> {
    this.logger.debug('Creating README file');
    const { key } = filters;
    const dir = `/tmp/wri-${key}`;
    const filePath = path.join(dir, '/README.csv');
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
