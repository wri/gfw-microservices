import { Transform } from 'stream';
import {
  generateAlertsPrioritiesLocationsLevel,
  generateAlertsLocationsLevel,
  generateAlertsDailyLocationLevel,
} from '../parser/alerts.parser';
import {
  ALERTS_LOCATION_LEVEL,
  ALERTS_LOCATION_LEVEL_DAILY,
  ALERTS_PRIORITIES_LOCATION_LEVEL,
} from '../shared/constants';
export class AlertsFilterData extends Transform {
  constructor(
    private selectedAlert: string,
    private selectedTimeframe: string,
    private startDate: string,
    private endDate: string,
    private listName: string,
    private file: string = ALERTS_PRIORITIES_LOCATION_LEVEL
  ) {
    super({ objectMode: true });
  }

  _transform(chunk, _, next) {
    if (chunk === undefined || chunk === null || Object.keys(chunk).length === 0) {
      return next();
    }

    if (this.file === ALERTS_PRIORITIES_LOCATION_LEVEL) {
      const value = generateAlertsPrioritiesLocationsLevel({
        feature: chunk,
        selectedAlert: this.selectedAlert,
        selectedTimeframe: this.selectedTimeframe,
        startDate: this.startDate,
        endDate: this.endDate,
        listName: this.listName,
      });
      next(null, value);
    } else if (this.file === ALERTS_LOCATION_LEVEL) {
      const value = generateAlertsLocationsLevel({
        feature: chunk,
        selectedAlert: this.selectedAlert,
        selectedTimeframe: this.selectedTimeframe,
        startDate: this.startDate,
        endDate: this.endDate,
        listName: this.listName,
      });
      next(null, value);
    } else if (this.file === ALERTS_LOCATION_LEVEL_DAILY) {
      const value = generateAlertsDailyLocationLevel({
        feature: chunk,
        selectedAlert: this.selectedAlert,
        startDate: this.startDate,
        endDate: this.endDate,
        listName: this.listName,
      });
      next(null, value);
    } else {
      next(null, []);
    }
  }
}
