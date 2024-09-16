import { Injectable, Logger, Scope } from '@nestjs/common';
import {
  AlertFieldsFileRequest,
  AlertsTimeframes,
  BasicFieldsFileRequest,
  ListFieldsFileRequest,
} from '@wri-monorepos/sql';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({
  scope: Scope.REQUEST,
})
export class ReadmeService {
  private readonly logger = new Logger(ReadmeService.name);

  afiReadmeData() {
    return 'afi_readme.csv';
  }

  getSourceDir(fileToCopy: string): string {
    if (process.env.NODE_ENV === 'test') {
      return '/mock/source/dir/' + fileToCopy;
    } else {
      return path.resolve(__dirname, 'assets/readme', fileToCopy);
    }
  }

  getDestDir(key: string): string {
    if (process.env.NODE_ENV === 'test') {
      return `/tmp/wri-${key}/README.csv`;
    } else {
      return path.join('/tmp', `wri-${key}`, 'README.csv');
    }
  }

  alertsReadmeData(filters: AlertFieldsFileRequest) {
    const { selectedTimeframe } = filters;

    const alertsFilesByTimeFrame = {
      [AlertsTimeframes.DAY]: 'daily_alerts_readme.csv',
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

    if (listsViews[listView]) {
      return listsViews[listView];
    }
  }

  async write(filters: BasicFieldsFileRequest): Promise<void> {
    const { type, key } = filters;

    const returnFileToCopy = {
      afi: this.afiReadmeData,
      alerts: this.alertsReadmeData,
      everything: this.everythingBundleReadmeData,
      southEastAsiaTCL: this.southEastAsiaTCL,
    };

    if (!Object.prototype.hasOwnProperty.call(returnFileToCopy, type)) {
      this.logger.warn(`[${type}] is not a valid type`);
      return;
    }

    const fileToCopy = returnFileToCopy[type](filters);

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
