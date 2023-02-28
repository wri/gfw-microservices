import * as fs from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter, PassThrough, Transform } from 'stream';

import  { formatPct, validatePct } from '../shared/functions'
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { FilterSelection } from '../shared/filter.transform';
import { IPipeService } from './IPipeService';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';

class CountryAggregator extends EventEmitter{

  private countries = new Set();

  constructor() {
    super();
    this.on('storeCountry', this.storeCountry);
    this.on('cleanCountry', this.cleanCountry);
  }

  storeCountry(country: string) {
    this.countries.add(country);
  }

  cleanCountry() {
    this.countries = new Set();
  }

  getCountries() {
    return this.countries;
  }

}

class EventEmitterTransform extends Transform {
  constructor(private eventEmitter: EventEmitter) {
    super({ objectMode: true });
  }

  _transform(chunk: any, _, next) {
    const { Country } = chunk;
    this.eventEmitter.emit('storeCountry', Country);
    next();
  }
}

@Injectable()
export class ForestChangeDiagnosticListSummaryService extends IPipeService {
  private readonly logger = new Logger(ForestChangeDiagnosticListSummaryService.name);
  private inputStream: PassThrough;
  private countryAggregator: CountryAggregator;
  private readonly FILE_SUFFIX = 'forest_change_diagnostic_list_summary'

  start(filters: GenerationFileRequest) {
    const { listID } = filters;
    this.logger.log(`(${listID}) - Starting Dashboard download for ForestChangeDiagnosticListSummary stream to process data`);

    this.countryAggregator = new CountryAggregator();
    this.inputStream = new PassThrough({
      objectMode: true
    })

    this.organizeStream(filters)
    this.countryAggregator.emit('cleanCountry');
  }

  process(analysisData: any, filters: GenerationFileRequest) {
    const { listName } = filters;
    analysisData.forEach((data) => this.inputStream.write({ list_name: listName ,...data}));
  }

  private organizeStream(filters: GenerationFileRequest) {
    const { listID, selectedLocationsList } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', (err) => {
      this.logger.error(`(${listID}) - Error on stream: ${err}`);
      this.errorEmail(filters);
    })

    this.inputStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new EventEmitterTransform(this.countryAggregator));

    return this.inputStream;
  }

  finish(filters: GenerationFileRequest) {
    const { key, listName, listLevelAnalysis } = filters;
    const csvData = []
    csvData.push(EXCEL_TEMPLATE_HEADERS['forestChangeDiagnosticListSummary']);
    const dataRow = [listName];
    const totalArea = listLevelAnalysis.total_area;
    const countryStr = [...this.countryAggregator.getCountries()].join(',');

    EXCEL_TEMPLATES['forestChangeDiagnosticListSummary'].forEach((key) => {
      dataRow.push(countryStr.replace(/,/g, ';'));
          key.fields.forEach((field) => {
            const fieldValue = JSON.parse(listLevelAnalysis[field.attribute]);
            if (field.parsed === 'percent') {
              const percent = formatPct(validatePct((fieldValue / totalArea) * 100));
              dataRow.push(percent);
            } else if (field.parsed === 'aggregate') {
              dataRow.push(fieldValue.toFixed(2));
            }
          });
          csvData.push(dataRow);
    });
    const csvString = csvData.map((row) => row.join(',')).join('\n');
    fs.writeFileSync(`/tmp/${key}_${this.FILE_SUFFIX}.csv`, `${csvString}\n`);
  }
}
