import { Injectable, Logger } from '@nestjs/common';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import { AFI_HEADER, AFI_HEADER_AGGREGATE } from '../shared/constants';

import { FilterObject } from '../transform/filter.object';
import { NegligibleRiskDiscretize } from '../transform/negligible.risk.discretize';
import { FormatNumber } from '../transform/format.number';
import { IPipeService } from '../pipe/i.pipe.service';

@Injectable()
export class AfiFileService extends IPipeService {
  private readonly logger = new Logger(AfiFileService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  async start(filters: GenerationFileRequest, suffix = 'deforestation_kpis') {
    await this.startEmail(filters);

    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    const header = suffix.includes('aggregated') ? AFI_HEADER_AGGREGATE : AFI_HEADER;

    this.organizeStream(filters, Object.keys(header), suffix);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${suffix}.csv`,
      `${Object.values(header).join(',')}\n`
    );
  }

  process(analysisData) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[], suffix: string) {
    const { listId, key, listName } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}_${suffix}.csv`, {
      flags: 'a',
    });

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
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    this.fileStream.removeAllListeners();
    this.fileStream.destroy();
  }
}
