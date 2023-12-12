// Put back in error handling when all layers have a type in config

import ImageLayer from '@arcgis/core/layers/ImageryLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import TiledLayer from '@arcgis/core/layers/TileLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import RasterFunction from '@arcgis/core/layers/support/RasterFunction';

import GladLayer from '../layers/GladLayer';
import RaddLayer from '../layers/RaddLayer';
import RaddCoverage from '../layers/RaddCoverage';
import createGFWIntegratedLayer from '../layers/GFWIntegratedLayer';
import TreeCoverLossLayer from '../layers/TreeCoverLossLayer';
import TreeCoverGainLayer from '../layers/TreeCoverGainLayer';
import IndonesiaLandCover from '../layers/IndonesiaLandCover';
import TreeCoverLayer from '../layers/TreeCoverLayer';
import TreeBiomassLayer from '../layers/TreeBiomassLayer';
import LandCoverLayer from '../layers/LandCoverLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import AboveGroundLayer from '../layers/AboveGroundLayer';
import viirsLayer from '../layers/VIIRSLayerUtil';

import { proLayers, treeCoverLossTilesUrl, soyPlantedYearsRange } from '../../../common/js/config';
const { viirsActiveFiresID, granChacoDeforestationID } = proLayers;

/**
 * Map Function that gets called for each entry in the provided layers config and returns an array of ArcGIS Layers
 * @param {object} layer - Layer Config object, see the layersConfig object in js/map/config.js for example
 * @return {Layer} esriLayer - Some sort of esri layer, current types are:
 *   - ArcGISDynamicMapServiceLayer
 *   - ArcGISTiledMapServiceLayer
 *   - ArcGISImageServiceLayer
 *   - FeatureLayer
 *   - MapImageLayer
 */
export const layerFactory = function LayersFactory(layersArray, view) {
  const layers = [];

  const today = new Date();
  const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

  let month = lastWeek.getUTCMonth() + 1; //months from 1-12
  let day = lastWeek.getUTCDate();
  const year = lastWeek.getUTCFullYear();

  month = month.toString();
  day = day.toString();

  if (month.length === 1) {
    month = '0' + month;
  }
  if (day.length === 1) {
    day = '0' + day;
  }

  const defaultDefExpression = "ACQ_DATE > date'" + year + '-' + month + '-' + day + "'";

  layersArray.forEach((layer) => {
    // if ((!layer.url && layer.type !== 'graphic') || !layer.type) { throw new Error(errors.missingLayerConfig); }
    // let esriLayer = {};
    const options = {};
    // const params = new ImageServiceParameters();
    // const imageParameters = new ImageParameters();

    let layerDef;
    if (layer.id === viirsActiveFiresID) {
      layerDef = defaultDefExpression;
    }
    switch (layer.type) {
      case 'map-image':
        const sublayers = [
          {
            id: layer.layerId,
            definitionExpression: layer.whereClause ? layer.whereClause : layerDef,
          },
        ];

        if (layer.id === granChacoDeforestationID) {
          sublayers.push({ id: 1 });
        }

        layers.push(
          new MapImageLayer({
            id: layer.id,
            url: layer.url,
            order: layer.order || undefined,
            minScale: 0,
            maxScale: 0,
            sublayers: sublayers,
            visible: layer.visible === true ? true : false,
          })
        );

        break;
      case 'tiled':
        options.id = layer.id;
        options.visible = layer.visible || false;
        options.opacity = layer.opacity || 1;
        options.order = layer.order || undefined;
        options.url = layer.url;
        layers.push(new TiledLayer(options));
        break;
      case 'tileLayer':
        layers.push(
          new WebTileLayer({
            urlTemplate: layer.layerConfig.body.url,
            id: layer.id,
            visible: false,
            order: layer.order || undefined,
            view: view,
            opacity: 1,
          })
        );
        break;
      case 'image':
        options.id = layer.id;
        options.visible = layer.visible || false;
        options.url = layer.url;
        const imageLayer = new ImageLayer(options);
        imageLayer.order = layer.order || undefined;
        if (layer.renderingRule && layer.renderingRule.rasterFunctionArguments) {
          // const rRule = new RasterFunction();
          // rRule.functionName = layer.renderingRule.rasterFunction;
          // rRule.functionArguments = {
          //   Colormap: layer.renderingRule.rasterFunctionArguments.Colormap
          // };
          // rRule.Raster = layer.renderingRule.rasterFunctionArguments.Raster;
          // imageLayer.renderingRule = rRule;

          var remapRF = new RasterFunction({
            functionName: 'Remap',
            functionArguments: {
              OutputValues: [1, 2, 1],
              InputRanges: [0, 1, 1, 16, 16, 17],
              AllowUnmatched: false,
            },
          });

          var colorMap = new RasterFunction({
            functionName: 'Colormap',
            functionArguments: {
              Colormap: [
                [1, null],
                [2, 255, 102, 153],
              ],
              Raster: remapRF,
            },
          });

          imageLayer.renderingRule = colorMap;
        } else if (layer.rasterFunctions) {
          const rRule = new RasterFunction();
          rRule.functionName = 'soy31';
          rRule.interpolation = 'RSP_NearestNeighbor';
          imageLayer.renderingRule = rRule;
        }
        layers.push(imageLayer);
        break;
      case 'feature':
        if (layer.legendConfig.items && layer.legendConfig.items[0]) {
          options.renderer = {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: layer.legendConfig.items[0].color,
              outline: {
                color: 'white',
                width: 0,
              },
            },
          };
        }
        options.id = layer.id;
        options.visible = layer.visible || false;
        options.outFields = layer.outFields || ['*'];
        options.minScale = layer.minScale || 0;
        options.maxScale = layer.maxScale || 0;
        options.definitionExpression = layer.defaultDefinitionExpression || '';
        options.popupTemplate = layer.popupTemplate;
        options.order = layer.order || undefined;
        options.url = layer.url;
        layers.push(new FeatureLayer(options));
        break;
      case 'vector-tile':
        //handle VIIRS layer separately
        if (layer.id === viirsActiveFiresID) {
          viirsLayer(layer.id, layer.url, layer.visible, layer.order).then((l) => layers.push(l));
        } else {
          options.id = layer.id;
          options.url = layer.url;
          options.visible = layer.visible || false;
          options.order = layer.order || undefined;
          layers.push(new VectorTileLayer(options));
        }
        break;
      case 'graphic':
        options.id = layer.id;
        options.visible = layer.visible || false;
        options.order = layer.order || undefined;
        layers.push(new GraphicsLayer(options));
        break;
      case 'glad':
        layers.push(
          new GladLayer({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      case 'radd':
        layers.push(
          new RaddLayer({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      case 'aboveGroundBiomass':
        layers.push(
          new AboveGroundLayer({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      case 'treeBiomass':
        layers.push(
          new TreeBiomassLayer({
            id: layer.id,
            visible: layer.visible || false,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      case 'landCover':
        layers.push(
          new LandCoverLayer({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      case 'primaryForest':
        layers.push(
          new WebTileLayer({
            urlTemplate: layer.layerConfig.body.url,
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            view: view,
          })
        );
        break;
      case 'radd-coverage':
        layers.push(
          new RaddCoverage({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            opacity: layer.layerConfig.body['coverage-options']?.opacity || 1,
            view: view,
          })
        );

        break;

      case 'integraded-deforestation-alerts':
        layers.push(
          new createGFWIntegratedLayer({
            id: layer.id,
            visible: true,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            opacity: 1,
            view: view,
          })
        );
        break;
      case 'soy-planted':
        const url = layer.layerConfig.body.url.replace('{year}', `${soyPlantedYearsRange[1]}`);
        layers.push(
          new WebTileLayer({
            urlTemplate: url,
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            view: view,
          })
        );
        break;
      case 'loss':
        layers.push(
          new TreeCoverLossLayer({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: treeCoverLossTilesUrl,
            view: view,
          })
        );
        break;
      case 'gain':
        layers.push(
          new TreeCoverGainLayer({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      case 'indonesia-land-cover':
        layers.push(
          new IndonesiaLandCover({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      case 'treeCover':
        layers.push(
          new TreeCoverLayer({
            id: layer.id,
            visible: layer.visible || false,
            order: layer.order || undefined,
            urlTemplate: layer.url,
            view: view,
          })
        );
        break;
      default:
        console.log('no matching layer type: ', layer.id);
      // throw new Error(errors.incorrectLayerConfig(layer.type));
    }
  });
  return layers;
};
