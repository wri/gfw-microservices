import { Button } from '@mui/base';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import React, { useEffect, useState } from 'react';
import { getListMbtileInfo } from '../../../../../common/js/userListLocations/services/userListMbtileInfo.service';
import { goToUserListLocations } from '../../../../../common/js/userListLocations/utils/userListLocationsMap.util';
import { DEFAULT_MAPVIEW_CENTER } from '../../../config/map.config';

import './mapRecenterButton.scss';

const MapRecenterButton = ({ selectedList = [], mapView, search }) => {
  const [mapInfo, setMapInfo] = useState([]);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (selectedList.length > 0) {
      getMapInfo();
      setShowButton(true);
    }
  }, [selectedList]);

  function getListId() {
    const queryParams = getQueryParams(search);
    const { selectedLocations } = queryParams;

    if (selectedLocations) {
      return selectedLocations;
    }

    return selectedList[0].id;
  }

  async function getMapInfo() {
    try {
      const response = await getListMbtileInfo(getListId());
      if (response && response.bounds) {
        setMapInfo(response.bounds);
      }
    } catch (error) {
      setMapInfo([]);
    }
  }

  const centerMap = () => {
    if (mapInfo.length > 0) {
      return goToUserListLocations(mapView, mapInfo);
    }

    mapView.goTo({
      center: DEFAULT_MAPVIEW_CENTER,
      zoom: 3,
    });
  };

  return (
    <>
      {showButton && (
        <Button
          data-testid="map-center-button"
          onClick={centerMap}
          className="gfw-button btn-green center-button"
        >
          <FmdGoodIcon />
          back to location (s)
        </Button>
      )}
    </>
  );
};

export default MapRecenterButton;
