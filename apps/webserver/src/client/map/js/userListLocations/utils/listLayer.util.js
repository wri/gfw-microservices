import {
  getListLocationGeometry,
  getListMbtileInfo,
} from '../../../../common/js/userListLocations/services/userListMbtileInfo.service';
import {
  createGraphicFromGeojson,
  goToUserListLocations,
  setUserListLocationsVectorTileLayer,
} from './userListLocationsMap.util';
import { USER_LIST_LOCATIONS_VECTOR_TILE_LAYER_ID } from '../../config/map.config';
import { generateUserListLocationsVectorTileLayerStyle } from '../../../../common/js/userListLocations/utils/userListLocationsMapVectorTiles.util';

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
