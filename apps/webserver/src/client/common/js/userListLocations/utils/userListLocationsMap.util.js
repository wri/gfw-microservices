import Graphic from '@arcgis/core/Graphic';
import ExtentModule from '@arcgis/core/geometry/Extent';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';

const Extent = ExtentModule?.default || ExtentModule;

// Utils
import geojsonUtil from '../../utils/arcgis-to-geojson';
import {
  getLongLat,
  getVectorTilePointFeature,
  handleVectorTileHighlightLayerStyle,
} from './userListLocations.util';

// Configs
import { USER_LIST_LOCATIONS_VECTOR_TILE_LAYER_ID } from '../../../../map/js/config/map.config';
import { generateUserListLocationsVectorTileLayerStyle } from './userListLocationsMapVectorTiles.util';

/**
 * @description - Normalizes MBTiles bounds into a numeric {xmin, ymin, xmax, ymax} object.
 */
export function normalizeUserListBounds(bounds) {
  if (Array.isArray(bounds)) {
    const [xmin, ymin, xmax, ymax] = bounds;
    return { xmin, ymin, xmax, ymax };
  }

  if (typeof bounds === 'string') {
    const numericValues = bounds
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item));

    if (numericValues.length === 4) {
      const [xmin, ymin, xmax, ymax] = numericValues;
      return { xmin, ymin, xmax, ymax };
    }

    return null;
  }

  if (bounds && typeof bounds === 'object') {
    const { xmin, ymin, xmax, ymax } = bounds;
    return { xmin, ymin, xmax, ymax };
  }

  return null;
}

/**
 * @description - Adjusts the Esri MapView to focus on a specified extent, defined by the geographical bounds of a vector tile layer.
 *
 * @param {Array<number>|Object|string|null|undefined} bounds - Geographical bounds of the vector tile layer.
 * These can be provided as [xmin, ymin, xmax, ymax], an object with xmin/ymin/xmax/ymax, or a comma-separated string.
 */
export function goToUserListLocations(bounds) {
  const defaultExtent = new Extent({
    xmin: -180,
    ymin: -90,
    xmax: 180,
    ymax: 90,
    spatialReference: SpatialReference.WGS84,
  });

  const normalizedBounds = normalizeUserListBounds(bounds);

  if (!normalizedBounds) {
    return defaultExtent;
  }

  const { xmin, ymin, xmax, ymax } = normalizedBounds;

  if (![xmin, ymin, xmax, ymax].every((value) => Number.isFinite(value))) {
    return defaultExtent;
  }

  return new Extent({
    xmin,
    ymin,
    xmax,
    ymax,
    spatialReference: SpatialReference.WGS84,
  });
}

/**
 * @description - Converts a GeoJSON object to ESRI's format and creates an ESRI Graphic. This Graphic object includes the geometry derived from the GeoJSON and any specified attributes.
 * @param {Object} geojson - A valid GeoJSON object representing the geometry for the ESRI Graphic.
 * @param {Object} properties - Attributes for the ESRI Graphic, which can include metadata or styling information.
 * @return {Graphic} An ESRI Graphic object created from the provided GeoJSON and attributes.
 */
export function createGraphicFromGeojson(geojson, properties) {
  return new Graphic({
    geometry: geojsonUtil.geojsonToArcGIS(geojson),
    attributes: properties,
  });
}

/**
 * @description - Adds a Vector Tile Layer to an Esri MapView representing user list locations. It configures the layer based on MBTile info and sets up interactivity depending on the page context.
 *
 * @param {Object} esriMapView - Esri MapView object.
 * @param {Object} listMbtileInfo - Contains details about the MBTile file, such as the file name.
 * @param {string} page - Page name where the Vector Tile Layer is rendered, influencing interactivity (e.g., 'map', 'locations').
 * @param {Array} locationIDs - (Optional) Array of location IDs used for filtering or highlighting specific locations in the Vector Tile Layer.
 */
export async function setUserListLocationsVectorTileLayer(
  esriMapView,
  listMbtileInfo,
  page,
  locationIDs = []
) {
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
        handleVectorTileHighlightLayerStyle(
          userLocationsVectorTileLayer,
          graphic.attributes.location_id
        );
      }
    });

    if (page !== 'locations') {
      esriMapView.on('click', async (event) => {
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
