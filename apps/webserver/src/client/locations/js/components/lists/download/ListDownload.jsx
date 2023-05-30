/* eslint-disable no-undef */
import React, { useState } from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import IconChevronDown from '../../../../../common/js/components/icon/IconChevronDown';
import downloadRequest from './downloadRequest';
import { userAccessLevel, locationsPage } from '../../../../../common/js/config';
import { isDownloadDisabledForThisList } from '../../../utils/lists.utils';
import { gfwListNames } from '../../../../../common/js/constants/lists.constants';
import ConfirmDialog from './confirmDialog';

const style = {
  buttonStyle: {
    borderRadius: '18px',
    color: 'inherit',
  },
  overlay: {
    borderRadius: '18px',
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    height: '100%',
  },
};

function ListDownload({
  combinedColumns,
  currentUser,
  filters,
  isLoading,
  listFilterStr,
  listID,
  listName,
  selectedList,
  tableSortedBy,
  selectedLocations,
  tableSortedDesc,
  listView,
  allLocationsSelected,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const localHandleDownload = (selectedOption) => {
    const { format, type } = selectedOption;
    isLoading(true);
    setDialogOpen(true);

    downloadRequest({
      listID,
      format,
      type,
      filters,
      listFilterStr,
      tableSortedBy,
      tableSortedDesc,
      combinedColumns,
      selectedLocations,
      allLocationsSelected,
      listView,
    })
      .then(() => {
        isLoading(false);
      })
      .catch((err) => {
        console.warn('err', err);
      });

    switch (format) {
      case 'csv':
        if (type === 'results') {
          ga(
            'send',
            'event',
            'Download',
            'results download click',
            'user clicked on the results option in the download dropdown menu'
          );
        } else {
          ga(
            'send',
            'event',
            'Download',
            'csv download click',
            'user clicked on the csv option in the download dropdown menu'
          );
        }
        break;
      case 'shapefile':
        ga(
          'send',
          'event',
          'Download',
          'shapefile download click',
          'user clicked on the shapefile option in the download dropdown menu'
        );
        break;
      default:
        break;
    }
  };

  const isGFWList = selectedList.associated_gfwlist || gfwListNames.includes(listName);
  const downloadEnabled = !isDownloadDisabledForThisList(selectedList);
  const isSourceFileDownloadEnabled =
    !isGFWList && currentUser.access_level_id !== userAccessLevel.VIEWER;
  return (
    downloadEnabled && (
      <>
        <IconMenu
          iconButtonElement={
            <RaisedButton
              overlayStyle={style.overlay}
              buttonStyle={style.buttonStyle}
              className="button tertiary button--tertiary"
              icon={<IconChevronDown />}
              labelPosition="before"
              label="Download"
            />
          }
          onChange={(_evt, selectedOption) => localHandleDownload(selectedOption)}
        >
          <MenuItem value={{ format: 'csv', type: 'results' }} primaryText="Results" />

          {isSourceFileDownloadEnabled && (
            <MenuItem
              value={{ format: 'csv', type: 'input' }}
              primaryText={locationsPage.lists.csv}
            />
          )}

          {isSourceFileDownloadEnabled && (
            <MenuItem
              value={{ format: 'shapefile', type: 'input' }}
              primaryText={locationsPage.lists.shapefile}
            />
          )}
        </IconMenu>
        <ConfirmDialog open={dialogOpen} setDialogOpen={setDialogOpen} />
      </>
    )
  );
}

export default ListDownload;
