import { Transform } from 'stream';

export class FilterTimeframeIntegratedAlerts extends Transform {
  private columns: string[];
  private startDate: Date;
  private endDate: Date;

  constructor(columns, startDate, endDate) {
    super({ objectMode: true });
    this.columns = columns;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  _transform(data, encoding, callback) {
    try {
      const filteredData = this.filterData(data);
      this.push(filteredData);
      callback();
    } catch (err) {
      callback(err);
    }
  }

  filterData(data) {
    const filteredData = { ...data };
    this.columns.forEach((column) => {
      if (filteredData[column]) {
        const alerts = JSON.parse(filteredData[column]);
        const filteredAlerts = {};
        for (const [date, value] of Object.entries(alerts)) {
          const alertDate = new Date(date);
          if (alertDate >= this.startDate && alertDate <= this.endDate) {
            filteredAlerts[date] = value;
          }
        }
        filteredData[column] = JSON.stringify(filteredAlerts);
      }
    });
    return filteredData;
  }
}
