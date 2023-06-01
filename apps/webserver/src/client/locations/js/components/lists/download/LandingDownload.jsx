/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import MenuItem from 'material-ui/MenuItem';
import ArrowRightIcon from 'material-ui/svg-icons/navigation/chevron-right';

import InlineLoader from 'common/js/components/Loaders/InlineLoader';
import { locationsPage } from 'common/js/config';
import downloadRequest from './downloadRequest';

function LandingDownload({
  downloadRequestedFromFolder,
  error_file_storage_path,
  hasErrorFile,
  hideDownload,
  isLargeList,
  listID,
  locations,
  setConfirmDialog,
}) {
  const [isLoading, setIsloading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  const localHandleDownload = (selectedOption) => {
    const { format, type } = selectedOption;

    setIsloading(true);
    setConfirmDialog(true);

    downloadRequest({ listID, format, type })
      .then(() => {
        setIsloading(false);
        hideDownload();
      })
      .catch((err) => {
        console.warn('err', err);
      });

    if (downloadRequestedFromFolder) {
      // if the user clicked on the map option from a folder
      gtag('event', 'Folder Click', {
        ''event_category'': 'Landing Page Click',
        ''event_label'': 'User downloads list from folder view',
      });
    } else {
      gtag('event', 'User opens more menu for list from locations page', {
        ''event_category'': 'Landing',
        ''event_label'': 'Download',
      });
    }
  };

  useEffect(() => {
    const newMenuItem = [];

    if (locations > 0) {
      newMenuItem.push(
        <MenuItem
          primaryText={locationsPage.lists.csv}
          onClick={() => localHandleDownload({ format: 'csv', type: 'input' })}
        />
      );
      newMenuItem.push(
        <MenuItem
          primaryText={locationsPage.lists.shapefile}
          onClick={() => localHandleDownload({ format: 'shapefile', type: 'input' })}
        />
      );
    }

    if (isLargeList && hasErrorFile) {
      newMenuItem.push(
        <MenuItem
          primaryText="Download Error File"
          href={`/locations/downloadErrorFile?fileKey=${error_file_storage_path}`}
          target="_blank"
          component="a"
        />
      );
    }

    setMenuItems(newMenuItem);
  }, [isLargeList, hasErrorFile]);

  return (
    <>
      <MenuItem
        primaryText={locationsPage.lists.download}
        leftIcon={isLoading ? <InlineLoader /> : null}
        menuItems={menuItems}
        rightIcon={<ArrowRightIcon />}
      />
    </>
  );
}

export default LandingDownload;
