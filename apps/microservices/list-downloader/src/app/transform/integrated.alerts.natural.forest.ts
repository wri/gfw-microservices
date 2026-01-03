import { Transform } from 'stream';
import { isEmptyObject } from '../shared/functions';

const nominal = [
  'integratedAlertsDailyAllNominal',
  'integratedAlertsDailySbtnNominal',
  'integratedAlertsDailyJrcNominal',
];

const high = [
  'integratedAlertsDailyAllHigh',
  'integratedAlertsDailySbtnHigh',
  'integratedAlertsDailyJrcHigh',
];

const highest = [
  'integratedAlertsDailyAllHighest',
  'integratedAlertsDailySbtnHighest',
  'integratedAlertsDailyJrcHighest',
];

export class IntegratedAlertsNaturalForest extends Transform {
  private startDate: Date;
  private endDate: Date;
  private listName: string;

  constructor(listName, startDate, endDate) {
    super({ objectMode: true });
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.listName = listName;
  }

  _transform(chunk, encoding, callback) {
    try {
      if (isEmptyObject(chunk)) {
        return callback(null, []);
      }

      // SQL now returns pre-summed numeric values for the entire date range
      // We return a single row per confidence level with the aggregated totals
      const output: Array<Array<string | number>> = [];

      const nominalRow = this.mountRow(chunk, nominal, 'Nominal');
      const highRow = this.mountRow(chunk, high, 'High');
      const highestRow = this.mountRow(chunk, highest, 'Highest');

      nominalRow.length > 0 && output.push(nominalRow);
      highRow.length > 0 && output.push(highRow);
      highestRow.length > 0 && output.push(highestRow);

      callback(null, output);
    } catch (err) {
      callback(err, []);
    }
  }

  private mountRow(
    data: Record<string, any>,
    group: string[],
    confidenceLevel: string
  ): Array<string | number> {
    const { location_name, totalHa } = data;

    // Values are now already aggregated numbers from SQL
    const all = this.getNumericValue(data[group[0]]);
    const sbtn = this.getNumericValue(data[group[1]]);
    const jrc = this.getNumericValue(data[group[2]]);

    if (all || sbtn || jrc) {
      return [
        this.listName,
        location_name,
        'Deforestation (Integrated Alerts)',
        this.startDate.toISOString().split('T')[0],
        this.endDate.toISOString().split('T')[0],
        'all-time', // Since SQL aggregates all dates, we use 'all-time' as the date label
        totalHa,
        confidenceLevel,
        all,
        sbtn,
        jrc,
        1,
      ];
    }
    return [];
  }

  private getNumericValue(value: any): number {
    if (value === undefined || value === null) {
      return 0;
    }
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(numValue) ? 0 : numValue;
  }
}
