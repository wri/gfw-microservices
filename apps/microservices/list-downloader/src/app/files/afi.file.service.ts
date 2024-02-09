import { Injectable, Logger } from '@nestjs/common';
import { PassThrough, Transform } from 'stream';
import { finished } from 'stream/promises';
import { AfiAnalysisByListId, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as Chain from 'stream-chain';
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

  async start(filters: BasicFieldsFileRequest, suffix = 'deforestation_kpis') {
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

  process(analysisData: AfiAnalysisByListId[]) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }

  private organizeStream(filters: BasicFieldsFileRequest, allFields: string[], suffix: string) {
    const { listId, key, listName } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}_${suffix}.csv`, {
      flags: 'a',
    });

    let pipeline: Array<Transform> = [new FilterObject(allFields)];

    if (suffix.includes('aggregated')) {
      pipeline = [...pipeline, new NegligibleRiskDiscretize(), new FormatNumber()];
    } else {
      pipeline = [...pipeline, new FormatNumber()];
    }

    pipeline.push(
      csvWriter({
        sendHeaders: false,
      })
    );

    this.inputStream.pipe(new Chain(pipeline)).pipe(this.fileStream);
  }

  async finish(filters: BasicFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    this.fileStream.removeAllListeners();
    this.fileStream.destroy();
  }
}
