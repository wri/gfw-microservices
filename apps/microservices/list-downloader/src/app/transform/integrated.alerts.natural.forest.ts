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
        return callback([]);
      }

      const output: Array<Array<string | number>> = [];
      for (
        let date = new Date(this.startDate);
        date <= this.endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dateString = date.toISOString().split('T')[0];

        const nominalRow = this.mountRow(chunk, dateString, nominal, 'Nominal');
        const highRow = this.mountRow(chunk, dateString, high, 'High');
        const highestRow = this.mountRow(chunk, dateString, highest, 'Highest');
        nominalRow.length > 0 && output.push(nominalRow);
        highRow.length > 0 && output.push(highRow);
        highestRow.length > 0 && output.push(highestRow);
      }
      callback(null, output);
    } catch (err) {
      callback(err, []);
    }
  }

  mountRow(
    data,
    dateString: string,
    group: string[],
    confidenceLevel: string
  ): Array<string | number> {
    const { location_name, totalHa } = data;

    const all = JSON.parse(data[group[0]])[dateString] || 0;
    const sbtn = JSON.parse(data[group[1]])[dateString] || 0;
    const jrc = JSON.parse(data[group[2]])[dateString] || 0;

    if (all || sbtn || jrc) {
      return [
        this.listName,
        location_name,
        'Deforestation (Integrated Alerts)',
        this.startDate.toISOString().split('T')[0],
        this.endDate.toISOString().split('T')[0],
        dateString,
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
}
