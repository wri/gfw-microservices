import Deferred from 'dojo/Deferred';
import IdentifyTask from 'esri/tasks/IdentifyTask';
import IdentifyParameters from 'esri/tasks/support/IdentifyParameters';
import QueryTask from 'esri/tasks/QueryTask';
import Query from 'esri/tasks/support/Query';

export const queryAdmin = (location) => {
  const deferred = new Deferred();
  const { gadmid, serverLayerId } = location;
  //GADMID comes in these 3 options (e.g. "ABW", "ABW.2", "ABW.2.12") each denotes level

  const adminAreaServices = {
    0: 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin/MapServer/6',
    1: 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin/MapServer/5',
    2: 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin/MapServer/4',
  };

  const adminUrl = adminAreaServices[gadmid.split('.').length - 1];
  const queryTask = new QueryTask({
    url: adminUrl,
  });

  const where = `gadmid = '${gadmid}'`;

  const query = new Query();
  query.where = where;
  query.returnGeometry = true;
  query.outFields = ['iso', 'name_0'];

  if (Number(serverLayerId) < 6) {
    query.outFields.push('name_1', 'id_1');
  }

  if (Number(serverLayerId) < 5) {
    query.outFields.push('name_2');
  }

  queryTask.execute(query).then(
    (res) => {
      if (res && res.features && res.features.length > 0) {
        const { geometry, attributes } = res.features[0];
        const country = attributes.iso;
        const countryText = attributes.name_0;
        const region = attributes.hasOwnProperty('id_1') ? attributes.id_1 : '';
        const stateText = attributes.hasOwnProperty('name_1') ? attributes.name_1 : '';
        const substateText = attributes.hasOwnProperty('name_2') ? attributes.name_2 : '';

        deferred.resolve({
          geometry,
          country,
          countryText,
          region,
          stateText,
          substateText,
        });
      } else {
        deferred.resolve(false);
      }
    },
    function (error) {
      console.log(error);
      deferred.resolve(false);
    }
  );

  return deferred.promise;
};

export const queryExtent = (url, defQuery = '1=1') => {
  const deferred = new Deferred();

  const queryTask = new QueryTask({
    url: url,
  });

  const query = new Query();
  query.where = defQuery;
  query.returnGeometry = true;
  query.outFields = [];

  queryTask.executeForExtent(query).then(
    (res) => {
      if (res && res.extent) {
        deferred.resolve(res.extent.expand(1.2));
      } else {
        deferred.resolve(false);
      }
    },
    function (error) {
      console.log(error);
      deferred.resolve(false);
    }
  );

  return deferred.promise;
};

export const identifyPoints = (layer, evt, view) => {
  const deferred = new Deferred();

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

  const identifyTask = new IdentifyTask(layer.url);
  identifyTask.execute(params).then(
    (response) => {
      deferred.resolve({
        response: response,
        layer: layer.id,
      });
    },
    function (error) {
      console.log(error);
      deferred.resolve(false);
    }
  );

  return deferred.promise;
};
