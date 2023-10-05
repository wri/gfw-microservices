import { Injectable, Logger } from '@nestjs/common';
import { PassThrough } from 'stream';
import { IPipeService } from '../pipe/IPipeService';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import { AFI_HEADER, AFI_HEADER_AGGREGATE } from '../shared/constants';

import { FilterObject } from '../transform/filter.object';
import { NegligibleRiskDiscretize } from '../transform/negligible.risk.discretize';

@Injectable()
export class AfiFileService extends IPipeService {
  private readonly logger = new Logger(AfiFileService.name);
  private inputStream: PassThrough;

  start(filters: GenerationFileRequest, suffix = 'afi') {
    this.startEmail(filters);

    let header = AFI_HEADER_AGGREGATE;
    if (!suffix.includes('aggregated')) {
      header = AFI_HEADER;
    }

    const { listId, key } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    this.organizeStream(filters, Object.keys(header), suffix);
    fs.writeFileSync(`/tmp/${key}_${suffix}.csv`, `${Object.values(header).join(',')}\n`);
  }

  process(analysisData) {
    analysisData.forEach((data) => this.inputStream.write(data));
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[], suffix: string) {
    const { listId, key } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    });

    this.inputStream;

    if (!suffix.includes('aggregated')) {
      this.inputStream
        .pipe(new FilterObject(allFields))
        .pipe(new NegligibleRiskDiscretize())
        .pipe(
          csvWriter({
            sendHeaders: false,
          })
        )
        .pipe(fs.createWriteStream(`/tmp/${key}_${suffix}.csv`, { flags: 'a' }));
    } else {
      this.inputStream
        .pipe(new FilterObject(allFields))
        .pipe(
          csvWriter({
            sendHeaders: false,
          })
        )
        .pipe(fs.createWriteStream(`/tmp/${key}_${suffix}.csv`, { flags: 'a' }));
    }

    return this.inputStream;
  }

  async finish(filters: GenerationFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);
    this.waitFinishedProcess(this.inputStream);
  }
}
