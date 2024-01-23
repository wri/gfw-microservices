import * as fs from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter, PassThrough, Transform } from 'stream';
import { finished } from 'stream/promises';

import { formatPct, validatePct } from '../shared/functions';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { FilterSelection } from '../transform/filter.selection';
import { IPipeService } from '../pipe/i.pipe.service';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';

class CountryAggregator extends EventEmitter {
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

  _transform(chunk, _, next) {
    const { Country } = chunk;
    this.eventEmitter.emit('storeCountry', Country);
    next();
  }
}

@Injectable()
export class ForestChangeDiagnosticListSummaryService extends IPipeService {
  private readonly logger = new Logger(ForestChangeDiagnosticListSummaryService.name);
  private writeStream: PassThrough;
  private countryAggregator: CountryAggregator;

  start(filters: GenerationFileRequest) {
    if (this.isForestChangeDiagnosticListSummaryFile(filters)) {
      const { listId } = filters;
      this.logger.log(
        `(${listId}) - Starting Dashboard download for ForestChangeDiagnosticListSummary stream to process data`
      );

      this.countryAggregator = new CountryAggregator();
      this.writeStream = new PassThrough({
        objectMode: true,
      });

      this.organizeStream(filters);
      this.countryAggregator.emit('cleanCountry');
    }
  }

  process(analysisData, filters: GenerationFileRequest) {
    if (this.isForestChangeDiagnosticListSummaryFile(filters)) {
      const { listName } = filters;
      analysisData.forEach((data) => this.writeStream.write({ list_name: listName, ...data }));
    }
  }

  private organizeStream(filters: GenerationFileRequest) {
    const { listId, selectedLocationsList } = filters;
    this.writeStream.removeAllListeners();

    this.writeStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.writeStream
      .pipe(new FilterSelection(selectedLocationsList))
      .pipe(new EventEmitterTransform(this.countryAggregator));

    return this.writeStream;
  }

  private getSuffix(filters: GenerationFileRequest) {
    const { listView, selectedLocationsList } = filters;
    if (listView === 'commodity_risk' && selectedLocationsList.length != 1) {
      return 'commodity_risk_diagnostic_list_summary';
    } else {
      return 'forest_change_diagnostic_list_summary';
    }
  }

  private generateAggregate(filters: GenerationFileRequest) {
    const fileSuffix = this.getSuffix(filters);
    const { key, listName, listLevelAnalysis } = filters;
    let totalArea = Object.prototype.hasOwnProperty.call(listLevelAnalysis ?? {}, 'total_area')
      ? listLevelAnalysis['total_area']
      : 0;
    const csvData = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS['forestChangeDiagnosticListSummary']);
    const dataRow = [listName];
    totalArea = totalArea ?? 0;
    const countryStr = [...this.countryAggregator.getCountries()].join(',');

    EXCEL_TEMPLATES['forestChangeDiagnosticListSummary'].forEach((key) => {
      const { fields } = key;
      dataRow.push(countryStr.replace(/,/g, ';'));
      fields.forEach((field) => {
        const { attribute } = field;
        const input = Object.prototype.hasOwnProperty.call(listLevelAnalysis ?? {}, attribute)
          ? listLevelAnalysis[attribute]
          : '0';
        const fieldValue = JSON.parse(input);
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
    fs.writeFileSync(`/tmp/wri-${key}/${listName}_${fileSuffix}.csv`, `${csvString}\n`);
  }

  async finish(filters: GenerationFileRequest) {
    if (this.isForestChangeDiagnosticListSummaryFile(filters)) {
      this.writeStream.end();
      await finished(this.writeStream);
      this.generateAggregate(filters);
      this.writeStream.removeAllListeners();
      this.writeStream.destroy();
    }
  }

  isForestChangeDiagnosticListSummaryFile(filters: GenerationFileRequest) {
    const { selectedLocationsList, type } = filters;
    return (
      selectedLocationsList.length != 1 &&
      (type === 'forestChangeDiagnosticListSummary' || type === 'everything')
    );
  }
}
