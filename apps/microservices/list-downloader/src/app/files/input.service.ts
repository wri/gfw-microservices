import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as archiver from 'archiver';

import { Logger, Injectable, Scope } from '@nestjs/common';
import { PassThrough } from 'stream';
import { finished } from 'stream/promises';

import { IPipeService } from '../pipe/i.pipe.service';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { FilterSelection } from '../transform/filter.selection';
import { FilterObject } from '../transform/filter.object';
import { FormatNumber } from '../transform/format.number';
import { FilterColumnRules } from '../transform/filter.column.rules';

@Injectable({
  scope: Scope.REQUEST,
})
export class InputService extends IPipeService {
  private readonly logger = new Logger(InputService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;

  async start(filters: ListFieldsFileRequest) {
    const { listId, key, listName, fields = [], combinedColumnsSplitted = [] } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    let allFields = [...fields, ...combinedColumnsSplitted];
    allFields = [...new Set(allFields)];

    this.organizeStream(filters, allFields);
    fs.writeFileSync(`/tmp/wri-${key}/${listName}_input.csv`, `${allFields.join(',')}\n`);
    await this.startEmail(filters);
  }

  process(analysisData) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }

  async finish(filters: ListFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process input data`);
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    this.fileStream.destroy();
  }

  private organizeStream(filters: ListFieldsFileRequest, allFields: string[]) {
    const { key, selectedLocationsList, listId, listName } = filters;
    this.inputStream.removeAllListeners();

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}_input.csv`, { flags: 'a' });

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterObject(allFields))
      .pipe(new FilterColumnRules())
      .pipe(new FormatNumber())
      .pipe(
        csvWriter({
          sendHeaders: false,
        })
      )
      .pipe(this.fileStream);

    this.inputStream.on('end', async () => {
      const output = fs.createWriteStream(`/tmp/${key}.zip`);
      const archive = archiver('zip', {
        zlib: { level: 1 }, // Lower compression level to reduce CPU usage during zip.
      });
      archive.append(fs.createReadStream(`/tmp/wri-${key}/${listName}_input.csv`), {
        name: `${listName}_input.csv`,
      });
      archive.pipe(output);
      await archive.finalize();

      output.on('close', async () => {
        try {
          this.logger.log(`(${listId}) - Data has been zipped`);
          await this.finishProcess(filters);
        } catch (error) {
          // Catch and log post-processing failures (S3 upload, database write, etc.)
          // to prevent unhandled rejections from crashing the process
          const errorMsg = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `(${listId}) - Failed during post-processing: ${errorMsg}`,
            error instanceof Error ? error.stack : error
          );
        }
      });
    });

    return this.inputStream;
  }
}
