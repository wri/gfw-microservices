// Configs
import { USER_LIST_LOCATIONS_VECTOR_TILE_LAYER__LOCATIONS_HIGHLIGHT } from '../config/userListLocationsVectorTile.config';
import { USER_LIST_LOCATIONS_VECTOR_TILE_LAYER_ID } from '../../../../map/js/config/map.config';

// Utils
import tileQuery from './queryVectorTile/tileQuery';
import {
  generateUserListLocationsVectorTileLayerStyle,
  getVectorTileLayerHighLightFilter,
} from './userListLocationsMapVectorTiles.util';
import {
  createGraphicFromGeojson,
  goToUserListLocations,
  setUserListLocationsVectorTileLayer,
} from './userListLocationsMap.util';

// Services
import { getListLocationGeometry, getListMbtileInfo } from '../services/userListMbtileInfo.service';

/**
 * @description - Get Longitude/Latitude from mouse pointer x and y
 *
 * @param {Object} event - Click event object
 * @param {Object} esriMapView - Esri MapView object
 * @return {[]} - Longitude/Latitude of point (e.g. [-82.62212276458742, 39.88099237527944])
 */
export function getLongLat(event, esriMapView) {
  const xy = { x: event.x, y: event.y };
  const coords = esriMapView.toMap(xy);
  const longLat = [coords.longitude, coords.latitude];
  return longLat;
}

/**
 * @description - Get VectorTile Feature
 *
 * @param {number} zoom - Zoom level
 * @param {Array} longLat - Longitude/Latitude of point (e.g. [-82.62212276458742, 39.88099237527944])
 * @param {string} tiles - Tile URL (e.g. 'http://127.0.0.1:3060/services/VectorTileServer/{z}/{x}/{y}.pbf')
 * @param {string} layerName - Layer name (e.g. 'plants-layer')
 * @param {Object} listMbtileInfo - List MBTile file info
 * @return {Promise<*|boolean>}
 */
async function getVectorTileFeature({ zoom, longLat, tile, layerName, listMbtileInfo }) {
  const { maxZoom } = listMbtileInfo;
  console.log(zoom, maxZoom);

  const geojson = await tileQuery({
    point: longLat,
    radius: 10,
    units: 'feet',
    tiles: tile,
    layer: layerName,
    zoom: zoom > maxZoom ? maxZoom : zoom,
    buffer: false,
    pointInPolygon: true,
    logger: process.env.NODE_ENV === 'development',
  });

  return geojson.features.length ? geojson.features : null;
}

/**
 * @description - Get VectorTile Point feature
 *
 * @param {Object} esriMapView - Esri MapView object
 * @param {Array} longLat - Longitude/Latitude of point (e.g. [-82.62212276458742, 39.88099237527944])
 * @param {string} tile - Tile URL (e.g. 'http://127.0.0.1:3060/services/VectorTileServer/{z}/{x}/{y}.pbf')
 * @param {string} layerName - Layer name (e.g. 'plants-layer')
 * @param {Object} listMbtileInfo - List MBTile file info
 */
export async function getVectorTilePointFeature({
  esriMapView,
  longLat,
  tile,
  layerName,
  listMbtileInfo,
}) {
  const { zoom } = esriMapView;

  const features = await getVectorTileFeature({
    zoom,
    longLat,
    tile,
    layerName,
    listMbtileInfo,
  }).catch((error) => {
    console.error(error);
  });

  return features;
}

/**
 * @description - Handle user list locations Vector Tile layer highlight
 *
 * @param {Object} userLocationsVectorTileLayer - User list locations Vector Tile Layer
 * @param {number} locationID - Location ID
 */
export function handleVectorTileHighlightLayerStyle(userLocationsVectorTileLayer, locationID) {
  const styleLayerHighlight = userLocationsVectorTileLayer.getStyleLayer(
    USER_LIST_LOCATIONS_VECTOR_TILE_LAYER__LOCATIONS_HIGHLIGHT
  );

  if (locationID) {
    styleLayerHighlight.filter = getVectorTileLayerHighLightFilter(locationID);
    userLocationsVectorTileLayer.setStyleLayer(styleLayerHighlight);
  } else {
    styleLayerHighlight.filter = getVectorTileLayerHighLightFilter();
    userLocationsVectorTileLayer.setStyleLayer(styleLayerHighlight);
  }
}

/**
 * @description - Get Currently Selected List
 *
 * @param {Array} joinAllLists - All Lists
 * @param {Object} pageParams - Page Params - Dashboard or Locations page params
 * @return {Object} - Currently Selected List
 */
export function getCurrentlySelectedList(joinAllLists, pageParams) {
  return joinAllLists.find((list) => {
    return list.list_name === pageParams.name && list.id === parseInt(pageParams.i, 10);
  });
}

/**
 * @description - Get selected Popup Feature ESRI Graphic
 *
 * @param {string} listTableName - Selected Popup Feature list table name
 * @param {Object} selectedPopupFeature - Selected Popup Feature
 * @return {Object} - Selected Popup Feature ESRI Graphic
 */
export async function getSelectedPopupFeatureEsriGraphic(listTableName, selectedPopupFeature) {
  const { geojson } = await getListLocationGeometry(
    listTableName,
    selectedPopupFeature.attributes.location_id
  );

  const selectedPopupFeatureGraphic = createGraphicFromGeojson(
    geojson,
    selectedPopupFeature.attributes
  );

  return selectedPopupFeatureGraphic;
}

/**
 * @description - Handle user list locations Vector Tile Layer
 *
 * @param {Object} esriMapView - Esri MapView object
 * @param {number} listID - List ID (e.g. 1385)
 * @param {string} page - Page name where List Locations Vector Tile Layer is rendered (e.g. 'map', 'locations', etc.)
 * @return {Promise<void>}
 */
export async function handleUserListLocationsVectorTileLayer(
  esriMapView,
  listID,
  page = 'map',
  locationIDs = []
) {
  const listMbtileInfo = await getListMbtileInfo(listID);
  const { bounds, listMbtileFileNameOnly } = listMbtileInfo;

  goToUserListLocations(esriMapView, bounds);

  // Attach Vector Tile Layer if is not already attached otherwise just update vector tile layer style
  const userListLocationsVectorTileLayer = esriMapView.map.findLayerById(
    USER_LIST_LOCATIONS_VECTOR_TILE_LAYER_ID
  );

  if (!userListLocationsVectorTileLayer) {
    await setUserListLocationsVectorTileLayer(esriMapView, listMbtileInfo, page, locationIDs);
  } else {
    const userListLocationsVectorTileStyle = generateUserListLocationsVectorTileLayerStyle(
      listMbtileFileNameOnly,
      locationIDs
    );
    userListLocationsVectorTileLayer.loadStyle(userListLocationsVectorTileStyle);
  }
}
