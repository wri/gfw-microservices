import * as csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as archiver from 'archiver';

import { Logger, Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';

import { IPipeService } from './IPipeService';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { columnsListName, columnsTemplateId } from '../shared/constants'
import { FilterObject, FilterSelection } from '../shared/list.transform';

@Injectable()
export class InputService extends IPipeService {
  private readonly logger = new Logger(InputService.name);
  private inputStream: PassThrough;

  start(filters: GenerationFileRequest) {
    const { listID, key, templateId, combinedColumnsSplitted } = filters;
    this.logger.log(`(${listID}) - Starting stream to process data`);
    this.inputStream = new PassThrough({objectMode: true})

    const fields =
      columnsTemplateId[templateId] ?? columnsListName[templateId] ?? columnsTemplateId[14];
    let allFields = [...fields, ...combinedColumnsSplitted];
    allFields = [...new Set(allFields)];

    this.organizeStream(filters, allFields)
    fs.writeFileSync(`/tmp/${key}.csv`, `${allFields.join(',')}\n`);
    this.startEmail(filters);
  }

  process(analysisData: any) {
    analysisData.forEach(data =>  this.inputStream.write(data));
  }

  finish(filters: GenerationFileRequest) {
    const { listID, key } = filters;
    this.logger.log(`(${listID}) - Finished to process data`);
    this.inputStream.removeAllListeners();
    this.inputStream.destroy();

    const output = fs.createWriteStream(`/tmp/${key}.zip`);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
    archive.append(fs.createReadStream(`/tmp/${key}.csv`), { name: `${key}.csv` });
    archive.pipe(output);
    archive.finalize();

    output.on('close', () => {
      this.logger.log(`(${listID}) - Data has been zipped`);
      this.s3Service.sendFiletoS3(key, 'zip', 'application/zip', process.env.AWS_TMP_BUCKET);
      this.s3Service.getFileSignedUrl(key, 'zip', process.env.AWS_TMP_BUCKET).then(location => {
        this.finishedEmail(filters,  location);
      });
    });
  }

  private organizeStream(filters: GenerationFileRequest, allFields: string[]) {
    const { key, selectedLocationsList, listID } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    })

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new FilterObject(allFields))
      .pipe(csvWriter({
        sendHeaders: false
      }))
      .pipe(fs.createWriteStream(`/tmp/${key}.csv`, {flags: 'a'}))

    return this.inputStream;
  }
}
