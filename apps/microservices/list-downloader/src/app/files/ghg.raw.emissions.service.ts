import { Injectable, Logger, Scope } from '@nestjs/common';
import { PassThrough, Transform } from 'stream';
import { AfiAnalysisByListId, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { finished } from 'stream/promises';
import * as fs from 'fs';
import * as Chain from 'stream-chain';
import { GHG_RAW_EMISSIONS_HEADER } from '../shared/constants';

import { IPipeService } from '../pipe/i.pipe.service';
import { FormatNumber } from '../transform/format.number';
import { ConvertObject2CSV } from '../transform/convert.object.2.csv';
import { OrganizeGHGRawEmissionsResponse } from '../transform/organize.ghg.raw.emissions.response';

@Injectable({
  scope: Scope.REQUEST,
})
export class GhgRawEmissions extends IPipeService {
  private readonly logger = new Logger(GhgRawEmissions.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  start(filters: BasicFieldsFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    const [header, fileSuffix] = [GHG_RAW_EMISSIONS_HEADER, 'ghg_raw_emissions'];

    this.organizeStream(filters, Object.keys(header), fileSuffix);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${fileSuffix}.csv`,
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

    const pipeline: Array<Transform> = [
      new OrganizeGHGRawEmissionsResponse(),
      new FormatNumber(4),
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
