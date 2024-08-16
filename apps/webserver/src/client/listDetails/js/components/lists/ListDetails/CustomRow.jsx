import React, { useState } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import PublicIcon from '@mui/icons-material/Public';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import Button from '@mui/material/Button';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import redirectToMap from '../../../../../common/js/utils/redirect';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';

const greenButtonStyle = {
  color: '#97bd3d',
  padding: '0px 20px',
  '&:hover': {
    backgroundColor: 'rgba(151, 189, 61, 0.2)',
  },
};

const CustomRow = ({
  rowInfo,
  isGfwList,
  isSharedList,
  listId,
  viewDiagnostic,
  isListInDraftStatus,
  children,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const locationId = rowInfo?.location_id;

  const sendData = {
    listId,
    isGfwList,
    isSharedList,
    selectedLocations: locationId,
  };

  const isSelectedLocationActive = rowInfo?.location_status_id === listStatus.Active;
  const showLocationDiagnosticButton =
    isGfwList || (isSelectedLocationActive && !isListInDraftStatus);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '100%', display: 'flex' }}
    >
      {children}
      {(isHovered || isMenuOpen) &&
        !!locationId /* we check if there is a location id to prevent this menu to appear in the header row */ && (
          <div
            style={{
              position: 'absolute',
              right: '0px',
              backgroundColor: 'white',
              padding: '0px 20px',
            }}
          >
            {showLocationDiagnosticButton && (
              <Button
                className="list-analysis-actions__diagnostic-button"
                sx={{
                  color: '#97bd3d',
                }}
                data-cy="location-diagnostics"
                onClick={() => viewDiagnostic(locationId)}
                startIcon={<QueryStatsIcon />}
              >
                Location diagnostic
              </Button>
            )}

            <Button
              onClick={() => redirectToMap(sendData)}
              startIcon={<PublicIcon />}
              sx={greenButtonStyle}
            >
              Map
            </Button>

            <Button
              sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
              onClick={(e) => {
                setMenuAnchorEl(e.currentTarget);
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <MoreVertIcon sx={{ color: 'black' }} />
            </Button>

            <Popover
              anchorEl={menuAnchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={isMenuOpen}
              onRequestClose={() => setIsMenuOpen(false)}
              targetOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Menu className="context-menu">
                <MenuItem
                  primaryText="Copy/Move"
                  leftIcon={<DriveFileMoveIcon />}
                  onClick={() => {
                    console.log('copymove');
                  }}
                />
                <MenuItem
                  primaryText="Edit"
                  leftIcon={<EditIcon />}
                  onClick={() => {
                    console.log('edit');
                  }}
                />
                <MenuItem
                  primaryText="Download"
                  leftIcon={<DownloadIcon />}
                  onClick={() => {
                    console.log('download');
                  }}
                />

                <MenuItem
                  primaryText="Delete"
                  leftIcon={<DeleteIcon />}
                  style={{ color: 'red' }}
                  onClick={() => {
                    console.log('Delete');
                  }}
                />
              </Menu>
            </Popover>
          </div>
        )}
    </div>
  );
};

export default CustomRow;
