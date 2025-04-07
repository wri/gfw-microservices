import _isEmpty from 'lodash/isEmpty';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import Basemap from '@arcgis/core/Basemap';

// Utils
import {
  getCurrentlySelectedList,
  getSelectedPopupFeatureEsriGraphic,
} from '../../../common/js/userListLocations/utils/userListLocations.util';

/**
 * Get location Geometry from the selected feature
 * @param {Object} props - React component props
 * @param {Object} mapView - ESRI MapView
 * @param {Object} selectedList - Selected list
 * @return {Object} - Location Geometry
 */
export async function getLocationGeometry(props, mapView, selectedList) {
  let geometry = {};

  if (selectedList && !selectedList.isGlobalForestWatchList) {
    const { listData, userLists, gfwLists, userSharedLists } = props;
    const selectedFeaturePopup = mapView.popup.features[mapView.popup.selectedFeatureIndex];
    let listTableName;

    if (!_isEmpty(listData)) {
      // Finding the list details when the user is coming from dashboard or list page
      const joinAllLists = [...userLists, ...gfwLists, ...userSharedLists];
      const currentlySelectedList = getCurrentlySelectedList(joinAllLists, listData);
      listTableName = currentlySelectedList.list_table_name;
    } else {
      listTableName = selectedList?.list_table_name;
    }

    const selectedFeaturePopupGraphic = await getSelectedPopupFeatureEsriGraphic(
      listTableName,
      selectedFeaturePopup
    );
    geometry = selectedFeaturePopupGraphic.geometry;
  } else if (mapView?.popup?.features && mapView?.popup?.features.length > 0) {
    geometry = mapView.popup.features[mapView.popup.selectedFeatureIndex].geometry;
  }

  return geometry;
}

export const getBasemapConfiguration = () => {
  const undisputedBoundariesStyle = {
    version: 8,
    sources: {
      gadm_administrative_boundaries_undisputed: {
        type: 'vector',
        tiles: [
          'https://tiles.globalforestwatch.org/gadm_administrative_boundaries_undisputed/v4.1.65/default/{z}/{x}/{y}.pbf',
        ],
        tileSize: 512,
      },
    },
    layers: [
      {
        id: 'gadm_fill',
        type: 'fill',
        source: 'gadm_administrative_boundaries_undisputed',
        'source-layer': 'gadm_administrative_boundaries_undisputed',
        paint: {
          'fill-color': 'white',
          'fill-outline-color': 'gray',
        },
      },
    ],
  };

  const undisputedBoundariesLayer = new VectorTileLayer({
    style: undisputedBoundariesStyle,
    visible: true,
  });

  const disputedBoundariesStyle = {
    version: 8,
    sources: {
      gadm_administrative_boundaries_disputed: {
        type: 'vector',
        tiles: [
          'https://tiles.globalforestwatch.org/gadm_administrative_boundaries_disputed/v4.1.65/default/{z}/{x}/{y}.pbf',
        ],
        tileSize: 512,
      },
    },
    layers: [
      {
        id: 'gadm_fill',
        type: 'fill',
        source: 'gadm_administrative_boundaries_disputed',
        'source-layer': 'gadm_administrative_boundaries_disputed',
        paint: {
          'fill-color': 'white',
          'fill-outline-color': 'gray',
        },
      },
    ],
  };

  const disputedBoundariesLayer = new VectorTileLayer({
    style: disputedBoundariesStyle,
    visible: true,
  });

  const labelsLayer = new VectorTileLayer({
    portalItem: { id: 'ba52238d338745b1a355407ec9df6768' }, // Light Gray Canvas Labels
  });

  const customBasemap = new Basemap({
    referenceLayers: [labelsLayer],
    baseLayers: [disputedBoundariesLayer, undisputedBoundariesLayer],
  });
  return customBasemap;
};
