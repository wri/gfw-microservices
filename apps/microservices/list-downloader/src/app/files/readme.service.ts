import { Injectable, Logger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

import {
  AlertFieldsFileRequest,
  AlertsTimeframes,
  BasicFieldsFileRequest,
  ListFieldsFileRequest,
} from '@wri-monorepos/sql';
import { ServerConfigType } from '../../validators/server-config';
import { ReadmeMergeServices } from '../shared/readme.merge.service';
@Injectable({
  scope: Scope.REQUEST,
})
export class ReadmeService {
  private readonly logger = new Logger(ReadmeService.name);

  constructor(
    private readonly configService: ConfigService<ServerConfigType, true>,
    private readonly readmeMergeServices: ReadmeMergeServices
  ) {}

  afiReadmeData() {
    return 'afi_readme.csv';
  }

  getSourceDir(fileToCopy: string): string {
    try {
      if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
        return '/mock/source/dir/' + fileToCopy;
      } else {
        return path.resolve(__dirname, 'assets/readme', fileToCopy);
      }
    } catch (error) {
      this.logger.error(`Error getting source dir: ${error.message}`);
    }
  }

  getDestDir(key: string): string {
    const dirName = `wri-${key}`;
    if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
      return `/tmp/${dirName}/README.csv`;
    } else {
      return path.join('/tmp', `${dirName}`, 'README.csv');
    }
  }
  getPathDir(key: string) {
    const dirName = `wri-${key}`;
    try {
      if (this.configService.get('NODE_ENV', { infer: true }) === 'test') {
        return `/tmp/${dirName}/`;
      } else {
        return path.join('/tmp', `${dirName}`);
      }
    } catch (error) {
      this.logger.error(`Error getting path dir: ${error.message}`);
    }
  }

  alertsReadmeData(filters: AlertFieldsFileRequest): string | string[] {
    const { selectedTimeframe } = filters;

    if (selectedTimeframe === AlertsTimeframes.DAY) {
      return ['global_integrated_disturbance_alerts_daily_readme.csv', 'daily_alerts_readme.csv'];
    }

    const alertsFilesByTimeFrame = {
      [AlertsTimeframes.WEEK]: 'alerts_readme.csv',
      [AlertsTimeframes.MONTH]: 'alerts_readme.csv',
      [AlertsTimeframes.QUARTER]: 'alerts_readme.csv',
      [AlertsTimeframes.YEAR]: 'alerts_readme.csv',
    };

    return alertsFilesByTimeFrame[selectedTimeframe];
  }

  everythingBundleReadmeData(filters: ListFieldsFileRequest) {
    const { listView } = filters;

    const listsViews = {
      commodity_risk: 'everything_commodity_risk_readme.csv',
      forest_change: 'everything_forest_change_readme.csv',
    };

    if (listsViews[listView]) {
      return listsViews[listView];
    }
  }

  southEastAsiaTCL(filters: ListFieldsFileRequest) {
    const { listView } = filters;

    const listsViews = {
      forest_change: 'forest_change_south_east_asia_readme.csv',
    };
    // Return listsViews['forest_change'] if has no listView in filter
    return listsViews[listView] || listsViews['forest_change'];
  }

  countrySpecificReadmeData(filters: ListFieldsFileRequest, country: string) {
    const { listView } = filters;

    const listsViews = {
      forest_change: `${country}_forest_change_readme.csv`,
    };
    return listsViews[listView] || listsViews['forest_change'];
  }
  ghgReadmeData() {
    return 'ghg_readme.csv';
  }

  withoutReadme() {
    return null;
  }

  async write(filters: BasicFieldsFileRequest): Promise<void> {
    const { type, key, listName, listView } = filters;

    const returnFileToCopy = {
      afi: this.afiReadmeData,
      alerts: this.alertsReadmeData,
      everything: this.everythingBundleReadmeData,
      southEastAsiaTCL: this.southEastAsiaTCL,
      afiVC: this.withoutReadme,
      genericCountryReadme: this.countrySpecificReadmeData,
      ghg: this.ghgReadmeData,
    };

    if (!Object.prototype.hasOwnProperty.call(returnFileToCopy, type)) {
      this.logger.warn(`[${type}] is not a valid type`);
      return;
    }

    // Handle special cases that merge multiple README files
    if (type === 'everything' && listView === 'forest_change') {
      await this.readmeMergeServices.processFiles(
        [
          this.getSourceDir(returnFileToCopy[type](filters)),
          this.getSourceDir(returnFileToCopy['southEastAsiaTCL'](filters)),
          this.getSourceDir(returnFileToCopy['genericCountryReadme'](filters, 'argentina')),
          this.getSourceDir(returnFileToCopy['genericCountryReadme'](filters, 'colombia')),
          this.getSourceDir(returnFileToCopy['genericCountryReadme'](filters, 'south_america')),
        ],
        'PLEASE NOTE: The contents of your zip files will vary based on the locations and commodities within your data, and the types of analysis you requested. Not all CSVs listed here may apply.',
        this.getPathDir(key),
        listName
      );
      return;
    }

    if (type === 'ghg') {
      await this.readmeMergeServices.processFiles(
        [this.getSourceDir(returnFileToCopy[type]())],
        null,
        this.getPathDir(key),
        listName
      );
      return;
    }

    // Get the file(s) to copy
    let fileToCopyResult: string | string[] | null;
    if (type === 'alerts') {
      const alertFilters = filters as AlertFieldsFileRequest;
      fileToCopyResult = returnFileToCopy[type](alertFilters);

      // Handle alerts with DAY timeframe - merge multiple README files
      if (Array.isArray(fileToCopyResult)) {
        await this.readmeMergeServices.processFiles(
          fileToCopyResult.map((file) => this.getSourceDir(file)),
          null,
          this.getPathDir(key),
          listName || ''
        );
        return;
      }
    } else {
      fileToCopyResult = returnFileToCopy[type](filters);
    }

    // Handle single README file copy
    const fileToCopy = fileToCopyResult as string;

    if (!fileToCopy) {
      return;
    }

    const sourceDir = this.getSourceDir(fileToCopy);

    if (!sourceDir) {
      return;
    }

    const destFile = this.getDestDir(key);

    fs.copyFile(sourceDir, destFile, (err) => {
      if (err) {
        this.logger.error(`[${fileToCopy}] Error copying file: ${err.message}`);
        return;
      }
      this.logger.log(`[${fileToCopy}] File copied and renamed successfully!`);
    });
  }
}
