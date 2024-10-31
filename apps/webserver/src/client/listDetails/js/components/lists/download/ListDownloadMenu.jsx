import React, { useState } from 'react';
import {
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { Divider, Box, Button } from '@mui/material';
import { Menu, MenuItem, Popover } from 'material-ui/Menu';
import { userAccessLevel } from '../../../../../common/js/config';
import { isDownloadDisabledForThisList } from '../../../../../locations/js/utils/lists.utils';
import ConfirmDialog from '../../../../../locations/js/components/lists/download/confirmDialog';
import downloadRequest from '../../../../../locations/js/components/lists/download/downloadRequest';

function ListDownloadMenu({
  combinedColumns,
  currentUser,
  filters,
  isLoading,
  listFilterStr,
  listID,
  selectedList,
  tableSortedBy,
  selectedLocations,
  tableSortedDesc,
  listView,
  allLocationsSelected,
  isGfwList,
  isHoverMenu,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = ({ format, type }) => {
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
      isGfwList,
    })
      .then(() => {
        isLoading(false);
      })
      .catch((err) => {
        console.warn('err', err);
      });

    switch (format) {
      case 'csv':
        gtag('event', 'csv download click', {
          event_category: 'Download',
          event_label: 'user clicked on the csv option in the download dropdown menu',
        });

        break;
      case 'shapefile':
        gtag('event', 'shapefile download click', {
          event_category: 'Download',
          event_label: 'user clicked on the shapefile option in the download dropdown menu',
        });
        break;
      default:
        break;
    }
  };

  const downloadEnabled = !isDownloadDisabledForThisList(selectedList);
  const isSourceFileDownloadEnabled =
    !isGfwList && currentUser.access_level_id !== userAccessLevel.VIEWER;

  return (
    downloadEnabled && (
      <>
        {isHoverMenu ? (
          <MenuItem
            leftIcon={<DownloadIcon height="14px" />}
            rightIcon={isMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            data-cy="download-list"
            onClick={handleOpenMenu}
            primaryText="DOWNLOAD"
          />
        ) : (
          <Button
            data-cy="download-list"
            startIcon={<DownloadIcon height="14px" />}
            endIcon={isMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={handleOpenMenu}
          >
            Download
          </Button>
        )}

        <Popover
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={isMenuOpen}
          onRequestClose={handleClose}
          targetOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Menu>
            {isSourceFileDownloadEnabled && (
              <MenuItem
                primaryText=" Location(s) CSV"
                data-cy="download-list-csv"
                onClick={() => handleMenuClick({ format: 'csv', type: 'input' })}
              />
            )}

            {isSourceFileDownloadEnabled && (
              <MenuItem
                primaryText="Location(s) Shapefile"
                data-cy="download-list-shapefile"
                onClick={() => handleMenuClick({ format: 'shapefile', type: 'input' })}
              />
            )}
            <Divider />
            <MenuItem>
              <Box sx={{ fontWeight: 'light', fontStyle: 'italic', fontSize: '12px' }}>
                Downloads contain location data only; no analysis
              </Box>
            </MenuItem>
          </Menu>
        </Popover>
        <ConfirmDialog open={dialogOpen} setDialogOpen={setDialogOpen} />
      </>
    )
  );
}

export default ListDownloadMenu;
