import { Transform } from 'stream';

import { isEmptyObject } from '../shared/functions';

const ALERT_PIXEL_SIZE_HA = 0.09;

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

export class GlobalIntegratedDisturbanceAlertsDaily extends Transform {
  private startDate: Date;
  private endDate: Date;
  private listName: string;

  constructor(listName: string, startDate: string, endDate: string) {
    super({ objectMode: true });
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.listName = listName;
  }

  _transform(chunk: Record<string, unknown>, encoding, callback) {
    try {
      if (isEmptyObject(chunk)) {
        return callback(null, []);
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

  private mountRow(
    data: Record<string, any>,
    dateString: string,
    group: string[],
    confidenceLevel: string
  ): Array<string | number> {
    const { location_name, totalHa, Country, State } = data;
    const subState = data['Sub State'];

    const all = this.getValueFromJson(data[group[0]], dateString);
    const sbtn = this.getValueFromJson(data[group[1]], dateString);
    const jrc = this.getValueFromJson(data[group[2]], dateString);

    if (all || sbtn || jrc) {
      const totalAlertHa = all * ALERT_PIXEL_SIZE_HA;
      const sbtnNaturalForestHa = sbtn * ALERT_PIXEL_SIZE_HA;
      // TODO: Replace placeholder with real data when SBTN Natural Open Ecosystems layer is available.
      const sbtnNaturalOpenEcosystemsHa = 0;
      const jrcForestHa = jrc * ALERT_PIXEL_SIZE_HA;

      return [
        `${this.listName}_Global_Integrated_Disturbance_Alerts_Daily`,
        location_name || '',
        totalHa || 0,
        Country || '',
        State || '',
        subState || '',
        'Global Integrated Disturbance Alert',
        this.startDate.toISOString().split('T')[0],
        this.endDate.toISOString().split('T')[0],
        dateString,
        confidenceLevel,
        totalAlertHa,
        sbtnNaturalForestHa,
        sbtnNaturalOpenEcosystemsHa,
        jrcForestHa,
        1,
      ];
    }

    return [];
  }

  private getValueFromJson(columnValue: string | undefined, dateString: string): number {
    if (!columnValue) {
      return 0;
    }

    try {
      const parsed = JSON.parse(columnValue);
      return parsed?.[dateString] || 0;
    } catch (error) {
      return 0;
    }
  }
}
