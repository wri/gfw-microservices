import { Transform } from 'stream';

export class FeatureExpandDailyAlerts extends Transform {
  constructor(private selectedAlert: string) {
    super({ objectMode: true });
  }

  _transform(feature, _, next) {
    const newArray = [];
    if (
      this.selectedAlert === 'Integrated' &&
      feature.gladTimeframe &&
      feature.gladTimeframe.length > 0
    ) {
      const { gladTimeframe } = feature;
      gladTimeframe.forEach((timeFrame) => {
        if (timeFrame.count > 0) {
          newArray.push({
            ...feature,
            date: timeFrame.day,
            count: timeFrame.count,
          });
        }
      });
      return next(null, newArray);
    } else if (
      this.selectedAlert === 'VIIRS' &&
      feature.fireTimeframe &&
      Object.keys(feature.fireTimeframe).length > 0
    ) {
      const { fireTimeframe } = feature;

      Object.keys(fireTimeframe).forEach((timeFrame) => {
        const [fireAlert] = fireTimeframe[timeFrame];
        if (fireAlert.count > 0) {
          newArray.push({
            ...feature,
            date: fireAlert.day,
            count: fireAlert.count,
          });
        }
      });
    }
    return next(null, newArray);
  }
}
