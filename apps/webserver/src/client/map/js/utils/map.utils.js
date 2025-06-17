import _isEmpty from 'lodash/isEmpty';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import Basemap from '@arcgis/core/Basemap';

// Utils
import {
  getCurrentlySelectedList,
  getSelectedPopupFeatureEsriGraphic,
} from '../../../common/js/userListLocations/utils/userListLocations.util';
import { MAP_WATER_COLOR } from '../config/map.config';

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
  const gadmAdministrativeBoundariesStyle = {
    version: 8,
    sources: {
      gadm_administrative_boundaries: {
        type: 'vector',
        tiles: [
          'https://tiles.globalforestwatch.org/gadm_administrative_boundaries/v4.1.84/default/{z}/{x}/{y}.pbf',
        ],
        tileSize: 512,
      },
    },
    layers: [
      {
        id: 'gadm_fill',
        type: 'fill',
        source: 'gadm_administrative_boundaries',
        'source-layer': 'gadm_administrative_boundaries',
        paint: {
          'fill-color': 'white',
          'fill-outline-color': 'gray',
        },
      },
    ],
  };

  const gadmAdministrativeBoundariesLayer = new VectorTileLayer({
    style: gadmAdministrativeBoundariesStyle,
    visible: true,
  });

  const labelsLayer = new VectorTileLayer({
    portalItem: { id: 'ba52238d338745b1a355407ec9df6768' }, // Light Gray Canvas Labels
  });

  const lakesLayer = new VectorTileLayer({
    portalItem: { id: '6d188135dc814d4ea254440a3dd844df' }, // Environment Surface Water and Label
  });

  lakesLayer.when(() => {
    lakesLayer.load().then(() => {
      const styleLayers = lakesLayer.currentStyleInfo?.style?.layers || [];

      styleLayers.forEach((layer) => {
        if (layer.type === 'fill' && layer.id.toLowerCase().includes('water')) {
          lakesLayer.setPaintProperties(layer.id, {
            'fill-color': MAP_WATER_COLOR,
          });
        }
      });
    });
  });

  const customBasemap = new Basemap({
    referenceLayers: [labelsLayer],
    baseLayers: [gadmAdministrativeBoundariesLayer, lakesLayer],
  });
  return customBasemap;
};
