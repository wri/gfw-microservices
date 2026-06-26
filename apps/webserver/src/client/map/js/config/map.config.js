export const USER_LIST_LOCATIONS_GRAPHICS_LAYER_ID = 'user-locations';
export const USER_LIST_LOCATIONS_VECTOR_TILE_LAYER_ID = 'user-list-locations-VectorTileLayer';
export const PLANET_BASEMAP = 'planet-basemap';
export const PLANET_BASEMAP_REFERENCE_LAYER = 'planet-basemap-reference-layer';
export const PLANET_BASEMAP_REFERENCE_LAYER_VECTOR_TILE_STYLE =
  'https://www.arcgis.com/sharing/rest/content/items/30d6b8271e1849cd9c3042060001f425/resources/styles/root.json';

// MapView Zoom Configurations
export const DEFAULT_MAPVIEW_GOTO_DURATION = 2_000;
export const DEFAULT_MAPVIEW_CENTER = [0, 16.53];
export const DEFAULT_MAPVIEW_ZOOM = 3;
export const DEFAULT_MAPVIEW_ZOOM_CENTER = {
  center: DEFAULT_MAPVIEW_CENTER,
  zoom: DEFAULT_MAPVIEW_ZOOM,
};
export const MAP_WATER_COLOR = '#b9defa';

// Zoom level at/above which the map may no longer line up with analysis pixels
// (geographic-projection differences). Surfaces the high-zoom accuracy warning.
// TODO(GPV-4587): confirm/tune exact threshold with product/GIS (pending technical subtask).
export const HIGH_ZOOM_WARNING_LEVEL = 13;
