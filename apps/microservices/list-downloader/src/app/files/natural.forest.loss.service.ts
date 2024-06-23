import { Injectable, Logger } from '@nestjs/common';
import { PassThrough, Transform } from 'stream';
import { AfiAnalysisByListId, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { finished } from 'stream/promises';
import * as fs from 'fs';
import * as Chain from 'stream-chain';
import {
  NATURAL_FOREST_LOST_KPIS_HEADER,
  NATURAL_FOREST_LOST_KPIS_HEADER_AGGREGATE,
} from '../shared/constants';

import { IPipeService } from '../pipe/i.pipe.service';
import { OrganizeNaturalForestLostResponse } from '../transform/organize.natural.forest.lost.response';
import { FormatNumber } from '../transform/format.number';
import { TotalCreatingNewField } from '../transform/total.creating.new.field';
import { ConvertObject2CSV } from '../transform/convert.object.2.csv';

@Injectable()
export class NaturalForestLossService extends IPipeService {
  private readonly logger = new Logger(NaturalForestLossService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  start(filters: BasicFieldsFileRequest, suffix: 'location' | 'list' = 'location') {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    const [header, fileSuffix] =
      suffix == 'list'
        ? [NATURAL_FOREST_LOST_KPIS_HEADER_AGGREGATE, 'natural_forest_loss_aggregated']
        : [NATURAL_FOREST_LOST_KPIS_HEADER, 'natural_forest_loss'];

    this.organizeStream(filters, Object.keys(header), fileSuffix);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${fileSuffix}.csv`,
      `${Object.values(header)
        .map((item) => item.name)
        .join(',')}\n`
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

    const level = suffix.includes('aggregated') ? 'list' : 'location';
    console.log(level);
    const pipeline: Array<Transform> = [
      new TotalCreatingNewField([
        {
          input: 'naturalForestLossByYear',
          output: 'sbtn_total',
        },
        {
          input: 'jrcForestLossByYear',
          output: 'jrc_total',
        },
      ]),
      new OrganizeNaturalForestLostResponse(level),
      new FormatNumber(),
      new ConvertObject2CSV(allFields),
    ];

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
