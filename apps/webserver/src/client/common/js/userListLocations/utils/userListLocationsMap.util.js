import Graphic from 'esri/Graphic';
import Extent from 'esri/geometry/Extent';
import PopupTemplate from 'esri/PopupTemplate';
import VectorTileLayer from 'esri/layers/VectorTileLayer';
import * as watchUtils from 'esri/core/watchUtils';

// Utils
import geojsonUtil from '../../utils/arcgis-to-geojson';
import { getLongLat, getVectorTilePointFeature, handleVectorTileHighlightLayerStyle } from './userListLocations.util';

// Configs
import { USER_LIST_LOCATIONS_VECTOR_TILE_LAYER_ID } from '../../../../map/js/config/map.config';
import { generateUserListLocationsVectorTileLayerStyle } from './userListLocationsMapVectorTiles.util';

/**
 * @description - Go to user list locations vector tile layer extent
 *
 * @param {Object} esriMapView - Esri MapView object
 * @param {[]} bounds - Bounds of vector tile layer (e.g. [-82.6221, 39.8809, -82.6221, 39.8809])
 */
export function goToUserListLocations(esriMapView, bounds) {
  const [xmin, ymin, xmax, ymax] = bounds;
  const extent = new Extent({
    xmin,
    ymin,
    xmax,
    ymax,
    spatialReference: 4326,
  });
  esriMapView.goTo(extent, { duration: 1000 });
}

/**
 * @description - Creat ESRI Graphic from GeoJSON
 * @param {Object} geojson - GeoJSON object
 * @param {Object} properties - Properties of Graphic attributes
 * @return {*}
 */

export function createGraphicFromGeojson(geojson, properties) {
  const featuresGeometryEsriJson = geojsonUtil.geojsonToArcGIS(geojson);

  const graphic = new Graphic({
    geometry: featuresGeometryEsriJson,
    attributes: properties,
  });

  return graphic;
}

/**
 * @description - Set user list locations Vector Tile Layer
 *
 * @param {Object} esriMapView - Esri MapView object
 * @param {Object} listMbtileInfo - List MBTile file info
 * @param {string} page - Page name where List Locations Vector Tile Layer is rendered (e.g. 'map', 'locations', etc.)
 */
export async function setUserListLocationsVectorTileLayer(esriMapView, listMbtileInfo, page, locationIDs = []) {
  const { listMbtileFileNameOnly } = listMbtileInfo;

  const userListLocationsVectorTileStyle = generateUserListLocationsVectorTileLayerStyle(
    listMbtileFileNameOnly,
    locationIDs
  );
  const userLocationsVectorTileLayer = new VectorTileLayer({
    id: USER_LIST_LOCATIONS_VECTOR_TILE_LAYER_ID,
    style: userListLocationsVectorTileStyle,
  });

  esriMapView.map.add(userLocationsVectorTileLayer);

  await userLocationsVectorTileLayer.when(() => {
    esriMapView.popup.watch('selectedFeature', (graphic) => {
      if (graphic) {
        handleVectorTileHighlightLayerStyle(userLocationsVectorTileLayer, graphic.attributes.location_id);
      }
    });

    if (page !== 'locations') {
      esriMapView.on('click', async (event) => {
        // // Reset highlight on popup close
        // watchUtils.whenTrueOnce(esriMapView.popup, 'visible', () => {
        //   watchUtils.whenFalseOnce(esriMapView.popup, 'visible', () => {
        //     handleVectorTileHighlightLayerStyle(userLocationsVectorTileLayer);
        //   });
        // });

        const { layerName, sources } = userLocationsVectorTileLayer.style;
        const [tile] = sources.local.tiles;

        const longLat = getLongLat(event, esriMapView);
        const features = await getVectorTilePointFeature({
          esriMapView,
          longLat,
          tile,
          layerName,
          listMbtileInfo,
        });

        if (features) {
          const getFeaturesGraphics = features.map((feature) => {
            // TODO: Move to 'trigger-action' fireActions
            const { geometry: geojson, properties } = feature;
            const graphic = createGraphicFromGeojson(geojson, properties);

            graphic.popupTemplate = new PopupTemplate({
              title: feature.properties['Location Name'],
            });

            return graphic;
          });

          esriMapView.popup.open({
            location: event.mapPoint, // Set the location of the popup to the clicked location
            features: getFeaturesGraphics,
          });
        } else {
          handleVectorTileHighlightLayerStyle(userLocationsVectorTileLayer);
        }
      });
    }
  });
}
