import { Injectable, Logger } from '@nestjs/common';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
import { IPipeService } from '../pipe/IPipeService';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import { AFI_HEADER, AFI_HEADER_AGGREGATE } from '../shared/constants';

import { FilterObject } from '../transform/filter.object';
import { NegligibleRiskDiscretize } from '../transform/negligible.risk.discretize';
import { FormatNumber } from '../transform/format.number';

@Injectable()
export class AfiFileService extends IPipeService {
  private readonly logger = new Logger(AfiFileService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  start(filters: GenerationFileRequest, suffix = 'afi') {
    this.startEmail(filters);

    const { listId, key } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    const header = suffix.includes('aggregated') ? AFI_HEADER_AGGREGATE : AFI_HEADER;

    this.organizeStream(filters, Object.keys(header), suffix);
    fs.writeFileSync(`/tmp/${key}_${suffix}.csv`, `${Object.values(header).join(',')}\n`);
  }

  process(analysisData) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[], suffix: string) {
    const { listId, key } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/${key}_${suffix}.csv`, { flags: 'a' });

    if (suffix.includes('aggregated')) {
      this.inputStream
        .pipe(new FilterObject(allFields))
        .pipe(new NegligibleRiskDiscretize())
        .pipe(new FormatNumber())
        .pipe(
          csvWriter({
            sendHeaders: false,
          })
        )
        .pipe(this.fileStream);
    } else {
      this.inputStream
        .pipe(new FilterObject(allFields))
        .pipe(new FormatNumber())
        .pipe(new FormatNumber())
        .pipe(
          csvWriter({
            sendHeaders: false,
          })
        )
        .pipe(this.fileStream);
    }

    return this.inputStream;
  }

  async finish(filters: GenerationFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);
    await this.waitFinishedProcess(this.inputStream);
    await finished(this.fileStream);
    this.fileStream.removeAllListeners();
    this.fileStream.destroy();
  }
}
