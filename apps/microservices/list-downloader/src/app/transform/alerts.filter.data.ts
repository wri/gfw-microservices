import { Transform } from 'stream';
import {
  generateAlertsPrioritiesLocationsLevel,
  generateAlertsLocationsLevel,
} from '../parser/alerts.parser';

export const ALERTS_PRIORITIES_LOCATION_LEVEL = 'alerts_priorities_location_level';
export const ALERTS_LOCATION_LEVEL = 'alerts_location_level';
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
      next(
        null,
        generateAlertsPrioritiesLocationsLevel({
          feature: chunk,
          selectedAlert: this.selectedAlert,
          selectedTimeframe: this.selectedTimeframe,
          startDate: this.startDate,
          endDate: this.endDate,
          listName: this.listName,
        })
      );
    } else if (this.file === ALERTS_LOCATION_LEVEL) {
      next(
        null,
        generateAlertsLocationsLevel({
          feature: chunk,
          selectedAlert: this.selectedAlert,
          selectedTimeframe: this.selectedTimeframe,
          startDate: this.startDate,
          endDate: this.endDate,
          listName: this.listName,
        })
      );
    } else {
      next(null, []);
    }
  }
}
