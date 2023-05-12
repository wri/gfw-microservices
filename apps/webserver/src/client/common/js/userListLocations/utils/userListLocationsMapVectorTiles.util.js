import {
  SERVER_DOMAIN_ORIGIN,
  USER_LIST_LOCATIONS_VECTOR_TILE_LAYER__LOCATIONS,
  USER_LIST_LOCATIONS_VECTOR_TILE_LAYER__LOCATIONS_HIGHLIGHT,
} from '../config/userListLocationsVectorTile.config';

/**
 * @description - Get Vector Tile Layer HighLight filter
 *
 * @param {string|number} locationID
 * @return {(string)[]}
 */
export function getVectorTileLayerHighLightFilter(locationID = '') {
  return ['==', 'location_id', locationID];
}

export function getVectorTileLayerHighLightFilterMultipleLocations(locationIDs = []) {
  if (locationIDs.length > 0) {
    return ['match', ['get', 'location_id'], locationIDs, true, false];
  }
  return [];
}

/**
 * @description - Generate user list locations Vector Tile Layer style
 *
 * @param {string} mbtileLayerName - MBTile layer name
 * @return {Object} - User list locations Vector Tile Layer style
 */
export function generateUserListLocationsVectorTileLayerStyle(mbtileLayerName, locationIDs = []) {
  return {
    layerName: mbtileLayerName, // This is a custom property
    version: 8,
    sprite:
      'https://cdn.arcgis.com/sharing/rest/content/items/75f4dfdff19e445395653121a95a85db/resources/styles/../sprites/sprite',
    glyphs:
      'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/resources/fonts/{fontstack}/{range}.pbf',
    sources: {
      local: {
        type: 'vector',
        tiles: [`${SERVER_DOMAIN_ORIGIN}/arcgis/rest/services/${mbtileLayerName}/VectorTileServer/{z}/{x}/{y}.pbf`],
      },
    },
    capabilities: 'TilesOnly, TileInfo, FeatureInfo',
    layers: [
      {
        id: USER_LIST_LOCATIONS_VECTOR_TILE_LAYER__LOCATIONS,
        type: 'fill',
        source: 'local',
        'source-layer': mbtileLayerName,
        paint: {
          // 'fill-color': 'rgba(253,67,193,0.25)',
          // 'fill-outline-color': 'rgba(253,67,193,1)',
          'fill-color': 'rgba(178,255,0,0)',
          'fill-outline-color': 'rgba(151,189,61,1)',
        },
        filter: getVectorTileLayerHighLightFilterMultipleLocations(locationIDs),
      },
      {
        id: USER_LIST_LOCATIONS_VECTOR_TILE_LAYER__LOCATIONS_HIGHLIGHT,
        type: 'fill',
        source: 'local',
        'source-layer': mbtileLayerName,
        paint: {
          'fill-color': 'rgba(3, 255, 255, 0.25)',
          'fill-outline-color': 'rgb(3, 255, 255)',
        },
        filter: getVectorTileLayerHighLightFilter(''),
      },
    ],
  };
}
