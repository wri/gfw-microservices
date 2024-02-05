import { EventEmitter, Transform } from 'stream';
import { COLUMN_COUNTRY, COLUMN_STATE, COLUMN_SUB_STATE } from '../shared/alert.utils';

export class FeatureDensityForAdminLevelAggregator extends EventEmitter {
  counts = {
    alerts: {},
    density: {},
  };

  constructor() {
    super();
    this.on('featureDensityForAdminLevel', this.featureDensityForAdminLevel);
    this.on('cleanFeatureDensityForAdminLevel', this.cleanFeatureDensityForAdminLevel);
  }

  cleanFeatureDensityForAdminLevel() {
    this.counts = {
      alerts: {},
      density: {},
    };
  }

  sumFeature(
    currentAlertsCount: number,
    adminLevelObject: any,
    subStateName: string,
    stateName: string,
    countryName: string
  ) {
    const countryObject = adminLevelObject[countryName] || {};
    const stateObject = countryObject[stateName] || {};

    const countsObjectValueCurrent = stateObject[subStateName] || 0;
    stateObject[subStateName] = countsObjectValueCurrent + currentAlertsCount;

    let countsObjectValueTotal = stateObject.total || 0;
    stateObject.total = countsObjectValueTotal + currentAlertsCount;
    countryObject[stateName] = stateObject;

    countsObjectValueTotal = countryObject.total || 0;
    countryObject.total = countsObjectValueTotal + currentAlertsCount;
    adminLevelObject[countryName] = countryObject;
  }

  featureDensityForAdminLevel({ subStateName, stateName, countryName, umd, featureAlertTotal }) {
    this.sumFeature(umd, this.counts.density, subStateName, stateName, countryName);
    this.sumFeature(featureAlertTotal, this.counts.alerts, subStateName, stateName, countryName);
  }

  getCounts() {
    return this.counts;
  }
}

export class AlertsEventEmitterTransform extends Transform {
  constructor(private eventEmitter: EventEmitter) {
    super({ objectMode: true });
  }

  getFeatureRowValueByColumnName = function (feature, columnName) {
    if (feature[columnName]) {
      return feature[columnName].includes(',') ? `"${feature[columnName]}"` : feature[columnName];
    } else {
      return '';
    }
  };

  _transform(chunk, _, next) {
    const subStateName = this.getFeatureRowValueByColumnName(chunk, COLUMN_SUB_STATE);
    const stateName = this.getFeatureRowValueByColumnName(chunk, COLUMN_STATE);
    const countryName = this.getFeatureRowValueByColumnName(chunk, COLUMN_COUNTRY);

    const { umd, featureAlertTotal } = chunk;
    this.eventEmitter.emit('featureDensityForAdminLevel', {
      subStateName,
      stateName,
      countryName,
      umd,
      featureAlertTotal,
    });
    next();
  }
}
