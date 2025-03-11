import * as QueryTask from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import { locationsPage } from '../../../../common/js/config';

export const geocodeMill = (mill) => {
  return new Promise((resolve) => {
    const queryObject = new Query({
      where: "id = '" + mill.ID + "'",
      returnGeometry: true,
      outFields: [],
    });

    QueryTask.executeQueryJSON(locationsPage.updatedPalmOilMillUrl, queryObject).then((result) => {
      if (result.features && result.features.length > 0) {
        resolve(result.features[0]);
      } else {
        resolve(false);
      }
    });
  });
};
