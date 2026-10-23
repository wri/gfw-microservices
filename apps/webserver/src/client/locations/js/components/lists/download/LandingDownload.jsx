import { useState, useEffect } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { ChevronRight as ArrowRightIcon, Download as DownloadIcon } from '@mui/icons-material';
import { locationsPage } from 'common/js/config';
import downloadRequest from './downloadRequest';
import errorLogger from '../../../../../common/js/utils/errorLogger';

function LandingDownload({
  downloadRequestedFromFolder,
  error_file_storage_path,
  hasErrorFile,
  closeMenu,
  isLargeList,
  listID,
  locations,
  setConfirmDialog,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
  const submenuOpen = Boolean(submenuAnchorEl);

  const localHandleDownload = (selectedOption) => {
    const { format, type } = selectedOption;
    closeMenu();
    setConfirmDialog(true);

    downloadRequest({ listID, format, type, source: 'landing' }).catch((err) => {
      errorLogger.warn('Error downloading list from landing page', {
        component: 'LandingDownload',
        action: 'localHandleDownload',
        error: err,
        listID,
        format,
        type,
      });
    });

    if (downloadRequestedFromFolder) {
      // if the user clicked on the map option from a folder
      gtag('event', 'Folder Click', {
        event_category: 'Landing Page Click',
        event_label: 'User downloads list from folder view',
      });
    } else {
      gtag('event', 'User opens more menu for list from locations page', {
        event_category: 'Landing',
        event_label: 'Download',
      });
    }
  };

  useEffect(() => {
    const newMenuItem = [];

    if (locations > 0) {
      newMenuItem.push(
        <MenuItem key="csv" onClick={() => localHandleDownload({ format: 'csv', type: 'input' })}>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>{locationsPage.lists.csv}</ListItemText>
        </MenuItem>
      );
      newMenuItem.push(
        <MenuItem
          key="shapefile"
          onClick={() => localHandleDownload({ format: 'shapefile', type: 'input' })}
        >
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>{locationsPage.lists.shapefile}</ListItemText>
        </MenuItem>
      );
      newMenuItem.push(
        <MenuItem
          key="geojson"
          onClick={() => localHandleDownload({ format: 'geojson', type: 'input' })}
        >
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>{locationsPage.lists.geojson}</ListItemText>
        </MenuItem>
      );
    }

    if (isLargeList && hasErrorFile && error_file_storage_path !== 'None') {
      newMenuItem.push(
        <MenuItem
          key="error-file"
          component="a"
          href={`/locations/downloadErrorFile?fileKey=${error_file_storage_path}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>Download Error File</ListItemText>
        </MenuItem>
      );
    }

    setMenuItems(newMenuItem);
  }, [isLargeList, hasErrorFile]);

  return (
    <>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          setSubmenuAnchorEl(submenuOpen ? null : e.currentTarget);
        }}
      >
        <ListItemIcon>
          <DownloadIcon />
        </ListItemIcon>
        <ListItemText>{locationsPage.lists.download}</ListItemText>
        <Box component="span" sx={{ display: 'flex', marginLeft: 'auto' }}>
          <ArrowRightIcon fontSize="small" />
        </Box>
      </MenuItem>
      <Menu
        anchorEl={submenuAnchorEl}
        open={submenuOpen}
        onClose={() => setSubmenuAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ svg: { fontSize: '1.25rem', color: 'text.primary' } }}
      >
        {menuItems}
      </Menu>
    </>
  );
}

export default LandingDownload;
