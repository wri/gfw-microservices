import { Injectable, Logger, Scope } from '@nestjs/common';
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
import { NegligibleRiskDiscretize } from '../transform/negligible.risk.discretize';
import { OverlapPercentageColumns } from '../transform/overlap.percentage.columns';
import { ConvertObject2Geojson } from '../transform/convert.object.2.geojson'
import { ConvertObject2String } from '../transform/convert.object.2.string'
import { ReplaceSpace2Underscore } from '../transform/replace.space.2.underscore'
import * as JSONStream from 'JSONStream';
import { FilterSelection } from '../transform/filter.selection'

@Injectable({
  scope: Scope.REQUEST,
})
export class OtherKpisService extends IPipeService {
  private readonly logger = new Logger(OtherKpisService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  start(filters: BasicFieldsFileRequest, level: 'location' | 'list' = 'location') {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    const [headers, fileSuffix] =
      level === 'list'
        ? [OTHER_KPIS_HEADER_AGGREGATE, 'other_metrics_aggregated']
        : [OTHER_KPIS_HEADER, 'other_metrics'];

    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${fileSuffix}.csv`,
      `${Object.values(headers).join(',')}\n`
    );

    this.organizeStream(filters, Object.keys(headers), fileSuffix);
  }

  private organizeStream(filters: BasicFieldsFileRequest & {selectedLocationsList?: []}, allFields: string[], suffix: string) {
    const { listId, key, listName, type, selectedLocationsList } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}_${suffix}.csv`, {
      flags: 'a',
    });

    let pipeline: Array<Transform> = [
      new OverlapPercentageColumns([
        {
          target: 'protectedAreasAreaPercentage',
          from: 'protectedAreasArea',
        },
        {
          target: 'landmarkAreaPercentage',
          from: 'landmarkArea',
        },
      ]),
      new FilterObject(allFields),
    ];

    if (suffix.includes('aggregated')) {
      pipeline = [...pipeline, new NegligibleRiskDiscretize(), new FormatNumber()];
    } else {
      pipeline = [...pipeline, new FormatNumber()];
    }
    if( type === "afi-vc"){
      this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}.geojson`, { flags: 'r+' });

      this.inputStream
        .pipe(new FilterSelection(selectedLocationsList))
        .pipe(new FilterObject(allFields))
        .pipe(new ReplaceSpace2Underscore())
        .pipe(new FormatNumber())
        .pipe(new ConvertObject2Geojson())
        .pipe(new ConvertObject2String())
        .pipe(JSONStream.parse(['features', true]))
        .pipe(JSONStream.stringify(open, '\n,\n', close))
        .pipe(this.fileStream);
    }else{
    pipeline.push(
      csvWriter({
        sendHeaders: false,
      })
    );
  }
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
