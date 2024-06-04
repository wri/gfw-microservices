import { Injectable, Logger } from '@nestjs/common';
import { PassThrough, Transform } from 'stream';
import { finished } from 'stream/promises';
import { AfiAnalysisByListId, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as Chain from 'stream-chain';
import { OTHER_KPIS_HEADER, OTHER_KPIS_HEADER_AGGREGATE } from '../shared/constants';

import { IPipeService } from '../pipe/i.pipe.service';
import { FilterObject } from '../transform/filter.object';
import { FormatNumber } from '../transform/format.number';

@Injectable()
export class OtherKpisService extends IPipeService {
  private readonly logger = new Logger(OtherKpisService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  start(filters: BasicFieldsFileRequest, suffix = '') {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    const [header, fileSuffix] =
      suffix == 'aggregated'
        ? [OTHER_KPIS_HEADER_AGGREGATE, 'other_metric_aggregated']
        : [OTHER_KPIS_HEADER, 'other_metric'];

    this.organizeStream(filters, Object.keys(header), fileSuffix);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${suffix}.csv`,
      `${Object.values(header).join(',')}\n`
    );
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
      pipeline = [...pipeline, new FormatNumber()];
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

  process(analysisData: AfiAnalysisByListId[]) {
    analysisData?.forEach((data) => this.inputStream.write(data));
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
