import _isEmpty from 'lodash/isEmpty';

// Utils
import { isGfwList } from '../../../common/js/utils/gfw.utils';
import { getCurrentlySelectedList } from '../../../common/js/userListLocations/utils/userListLocations.util';
import { getSelectedPopupFeatureEsriGraphic } from '../userListLocations/utils/listLayer.util';

/**
 * Get location Geometry from the selected feature
 * @param {Object} props - React component props
 * @param {Object} mapView - ESRI MapView
 * @param {Object} selectedList - Selected list
 * @return {Object} - Location Geometry
 */
export async function getLocationGeometry(props, mapView, selectedList) {
  let geometry = {};

  if (selectedList && !isGfwList(selectedList?.list_name)) {
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
