import { Transform } from 'stream';

import { isEmptyObject } from '../shared/functions';

// Field names for the different confidence levels (now numeric values from SQL)
const nominal = [
  'integratedAlertsAreaAllNominal',
  'integratedAlertsAreaSbtnNaturalForestsNominal',
  'integratedAlertsAreaSbtnNaturalEcosystemNominal',
  'integratedAlertsAreaJrcNominal',
];

const high = [
  'integratedAlertsAreaAllHigh',
  'integratedAlertsAreaSbtnNaturalForestsHigh',
  'integratedAlertsAreaSbtnNaturalEcosystemHigh',
  'integratedAlertsAreaJrcHigh',
];

const highest = [
  'integratedAlertsAreaAllHighest',
  'integratedAlertsAreaSbtnNaturalForestsHighest',
  'integratedAlertsAreaSbtnNaturalEcosystemHighest',
  'integratedAlertsAreaJrcHighest',
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
    const { location_name, totalHa, Country, State } = data;
    const subState = data['Sub State'];

    // Values are now already aggregated numbers from SQL (hectares)
    const all = this.getNumericValue(data[group[0]]);
    const sbtnForest = this.getNumericValue(data[group[1]]);
    const sbtnEcosystem = this.getNumericValue(data[group[2]]);
    const jrc = this.getNumericValue(data[group[3]]);

    if (all || sbtnForest || sbtnEcosystem || jrc) {
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
        'all-time', // Since SQL aggregates all dates, we use 'all-time' as the date label
        confidenceLevel,
        all, // Already in hectares
        sbtnForest, // Already in hectares
        sbtnEcosystem, // Already in hectares
        jrc, // Already in hectares
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
