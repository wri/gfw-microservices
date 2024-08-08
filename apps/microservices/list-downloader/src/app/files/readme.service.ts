import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
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
    if (selectedTimeframe === 'DAY') {
      return 'daily_alerts_readme.csv';
    }
  }

  async write(filters: BasicFieldsFileRequest): Promise<void> {
    const { type, key } = filters;
    const returnFileToCopy = {
      afi: this.afiReadmeData,
      alerts: this.alertsReadmeData,
    };

    if (!Object.prototype.hasOwnProperty.call(returnFileToCopy, type)) {
      this.logger.warn(`[${type}] is not a valid type`);
      return;
    }

    const fileToCopy = returnFileToCopy[type](filters);

    const sourceDir = this.getSourceDir(fileToCopy);

    const destFile = this.getDestDir(key);

    fs.copyFile(sourceDir, destFile, (err) => {
      if (err) {
        return this.logger.error(`[${fileToCopy}] Error copying file: ${err.message}`);
      }
      this.logger.log(`[${fileToCopy}] File copied and renamed successfully!`);
    });
  }
}
