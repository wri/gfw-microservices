/* eslint-disable object-shorthand */

// Utils
import utils from '../../../map/js/utils/AppUtils';

// Config
import { mapPage, proLayers } from '../config';

/**
 * @description - Get construct Layer Object
 *
 * @param {Array} visibleLayers - Array of visible layers
 * @param {Object} layer - Layer object
 * @return {Object} - Construct Layer Object
 */
/* eslint-disable-next-line import/prefer-default-export */
export const constructLayerObject = (visibleLayers, layer) => {
  let urlSegments;
  let layerUrl;
  let type;
  let layerObject;
  const layerName = layer.attributes.name;

  if (
    layer.attributes &&
    layer.attributes.layerConfig &&
    (layer.attributes.layerConfig.type === 'featureLayer' ||
      layer.attributes.layerConfig.type === 'featurelayer' ||
      layer.attributes.layerConfig.type === 'indexedVector' ||
      layer.attributes.layerConfig.type === 'Vector.Layer')
  ) {
    if (layer.attributes.layerConfig.body && layer.attributes.layerConfig.body.url) {
      if (layer.attributes.layerConfig.body.url.indexOf('MapServer/') > -1) {
        urlSegments = layer.attributes.layerConfig.body.url.split('MapServer/');
        layerUrl = urlSegments[0] + 'MapServer';
        type = 'map-image';
      } else if (
        layer.attributes.layerConfig.body.url.indexOf('VectorTileServer') > -1 ||
        layer.attributes.layerConfig.body.url.indexOf('resources/styles') > -1
      ) {
        layerUrl = layer.attributes.layerConfig.body.url;
        type = 'vector-tile';
      } else if (layer.attributes.layerConfig.body.url.indexOf('FeatureServer/') > -1) {
        layerUrl = layer.attributes.layerConfig.body.url;
        type = 'feature';
      } else if (layer.attributes.layerConfig.body.url.indexOf('ImageServer') > -1) {
        layerUrl = layer.attributes.layerConfig.body.url;
        type = 'image';
      } else if (layer.attributes.layerConfig.body.url.indexOf('carto.com') > -1) {
        layerUrl = layer.attributes.layerConfig.body.url;
        type = 'carto';
      } else if (layer.attributes.layerConfig.type === 'Vector.Layer') {
        layerUrl = layer.attributes.layerConfig.body.url;
        type = 'vector-tile';
      }
    }
  } else if (
    layer.attributes &&
    layer.attributes.layerConfig &&
    (layer.attributes.layerConfig.type === 'tileLayer' ||
      layer.attributes.layerConfig.type === 'tilelayer')
  ) {
    layerUrl = layer.attributes.layerConfig.body.url
      ? layer.attributes.layerConfig.body.url
      : layer.attributes.layerConfig.url;

    // Import all layer names that we will be using directly
    const {
      aboveGroundBiomassId,
      formaAlertsID,
      gladAlertsID,
      indonesiaLandCover,
      landCoverID,
      primaryForest,
      raddAlertsID,
      raddCoverageID,
      soyPlantedArea,
      treeBiomassLossID,
      treeCoverGainID,
      treeCoverID,
      treeCoverLossID,
    } = proLayers;

    switch (layerName) {
      case treeCoverLossID:
        type = 'loss';
        break;
      case treeCoverGainID:
        type = 'gain';
        break;
      case landCoverID:
        type = 'landCover';
        break;
      case primaryForest:
        type = 'primaryForest';
        break;
      case treeCoverID:
        type = 'treeCover';
        break;
      case treeBiomassLossID:
        type = 'treeBiomass';
        break;
      case formaAlertsID:
        type = 'forma';
        break;
      case gladAlertsID:
        type = 'glad';
        break;
      case raddAlertsID:
        type = 'radd';
        break;
      case raddCoverageID:
        type = 'radd-coverage';
        break;
      case soyPlantedArea:
        type = 'soy-planted';
        break;
      case aboveGroundBiomassId:
        type = 'aboveGroundBiomass';
        break;
      case indonesiaLandCover:
        type = 'indonesia-land-cover';
        break;
      default:
        type = 'tileLayer';
        break;
    }
  }

  const layerConf = utils.getObject(mapPage.layers, 'id', layerName);
  if (layerConf && type) {
    layerObject = {
      url: layerUrl,
      layerId: urlSegments && urlSegments.length > 1 ? urlSegments[1] : '',
      type: type,
      id: layerName,
      renderingRule: layer.attributes.layerConfig.body.renderingRule
        ? layer.attributes.layerConfig.body.renderingRule
        : '',
      rasterFunctions: layer.attributes.layerConfig.body.rasterFunctions
        ? layer.attributes.layerConfig.body.rasterFunctions
        : '',
      interpolation: layer.attributes.layerConfig.body.interpolation
        ? layer.attributes.layerConfig.body.interpolation
        : '',
      relatedLayers: layer.attributes.layerConfig.body.relatedLayers
        ? layer.attributes.layerConfig.body.relatedLayers
        : [],
      whereClause: layer.attributes.layerConfig.body.where,
      metadataId: layer.attributes.layerConfig.body.metadata,
      legendConfig: layer.attributes.legendConfig,
      layerConfig: layer.attributes.layerConfig,
      interactionConfig: layer.attributes.interactionConfig,
      cartoFields: layerConf.cartoFields ? layerConf.cartoFields : '',
      description: layer.attributes.description,
      group: layerConf.group,
      visible: visibleLayers.indexOf(layerName) > -1,
      region: layerConf.region ? layerConf.region : '',
      country: layerConf.country ? layerConf.country : '',
      countryCode: layerConf.countryCode ? layerConf.countryCode : '',
      subGroup: layerConf.subGroup ? layerConf.subGroup : '',
      order: layerConf.order ? layerConf.order : 0,
    };
  }

  return layerObject;
};
