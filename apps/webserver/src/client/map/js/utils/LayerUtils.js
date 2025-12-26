import { executeForExtent } from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import { identify } from '@arcgis/core/rest/identify';
import errorLogger from '../../../common/js/utils/errorLogger';

export const queryExtent = (url, defQuery = '1=1') => {
  return new Promise((resolve) => {
    const query = new Query();
    query.where = defQuery;
    query.returnGeometry = true;
    query.outFields = [];

    executeForExtent(url, query).then(
      (res) => {
        if (res?.extent) {
          resolve(res.extent.expand(1.2));
        } else {
          resolve(false);
        }
      },
      function (error) {
        errorLogger.error('Failed to query extent', {
          component: 'LayerUtils',
          action: 'queryExtent',
          url,
          error,
        });
        resolve(false);
      }
    );
  });
};

export const identifyPoints = (layer, evt, view) => {
  return new Promise((resolve) => {
    const visibleLayers = [];
    if (layer.sublayers) {
      layer.sublayers.forEach((sub) => {
        if (sub.visible && visibleLayers.indexOf(sub.id) === -1) {
          visibleLayers.push(sub.id);
        }
      });
    }

    // identifies the parameters passed into the server url
    const params = new IdentifyParameters();
    params.tolerance = 3;
    params.layerIds = visibleLayers;
    params.layerOption = 'visible';
    params.width = view.width;
    params.height = view.height;
    params.geometry = evt.mapPoint;
    params.mapExtent = view.extent;
    params.returnGeometry = true;

    identify(layer.url, params).then(
      (response) => {
        resolve({
          response: response,
          layer: layer.id,
        });
      },
      function (error) {
        errorLogger.error('Failed to identify points', {
          component: 'LayerUtils',
          action: 'identifyPoints',
          layerId: layer.id,
          error,
        });
        resolve(false);
      }
    );
  });
};
