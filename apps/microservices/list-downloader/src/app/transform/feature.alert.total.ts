import { Transform } from 'stream';

export class FeatureAlertTotal extends Transform {
  constructor(private timeframeProperty: string, private selectedAlert: string) {
    super({ objectMode: true });
  }

  _transform(feature, _, next) {
    const selectedData = feature[this.timeframeProperty];

    let featureAlertTotal = 0;
    if (selectedData) {
      if (this.selectedAlert === 'Integrated') {
        featureAlertTotal = selectedData.reduce((acc, val) => acc + val.count, 0);
      } else {
        featureAlertTotal = Object.values(selectedData)
          .map((arr: Array<{ count: number; day: string }>) =>
            arr.reduce((total, element) => total + element.count, 0)
          )
          .reduce((featureTotal, el) => featureTotal + el, 0);
      }
    }

    next(null, {
      ...feature,
      featureAlertTotal,
    });
  }
}
