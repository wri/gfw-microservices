import { Button } from '@mui/base';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import React, { useEffect, useState } from 'react';
import { getListMbtileInfo } from '../../../../../common/js/userListLocations/services/userListMbtileInfo.service';
import { goToUserListLocations } from '../../../../../common/js/userListLocations/utils/userListLocationsMap.util';
import { DEFAULT_MAPVIEW_CENTER } from '../../../config/map.config';

import './CenterButton.scss';

const CenterButton = ({ selectedList = [], mapView }) => {
  const [mapInfo, setMapInfo] = useState([]);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (selectedList.length > 0) {
      getMapInfo();
      setShowButton(true);
    }
  }, [selectedList]);

  async function getMapInfo() {
    const { bounds } = await getListMbtileInfo(selectedList[0].id);
    setMapInfo(bounds);
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
        <Button onClick={centerMap} className="gfw-button btn-green center-button">
          <FmdGoodIcon />
          back to location (s)
        </Button>
      )}
    </>
  );
};

export default CenterButton;
