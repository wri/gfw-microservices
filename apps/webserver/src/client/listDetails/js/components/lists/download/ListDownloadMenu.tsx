import { useState, MouseEvent } from 'react';
import {
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { Divider, Box, Button } from '@mui/material';
import { Menu, MenuItem, Popover } from 'material-ui';
import { userAccessLevel } from '../../../../../common/js/config';
import { isDownloadDisabledForThisList } from '../../../../../locations/js/utils/lists.utils';
import ConfirmDialog from '../../../../../locations/js/components/lists/download/confirmDialog';
import downloadRequest from '../../../../../locations/js/components/lists/download/downloadRequest';

interface ListDownloadMenuProps {
  combinedColumns: any[];
  currentUser: { access_level_id: number };
  filters: any;
  isLoading: (loading: boolean) => void;
  listFilterStr: string;
  listID: string;
  selectedList: any;
  tableSortedBy: string;
  selectedLocations: any[];
  tableSortedDesc: boolean;
  listView: string;
  allLocationsSelected: boolean;
  isGfwList: boolean;
  isHoverMenu?: boolean;
}

interface HandleMenuClickParams {
  format: 'csv' | 'shapefile';
  type: 'input';
}

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
  isHoverMenu = false,
}: ListDownloadMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const handleMenuClick = async ({ format, type }: HandleMenuClickParams) => {
    isLoading(true);
    setDialogOpen(true);
    handleClose();
    try {
      await downloadRequest({
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
      });
      isLoading(false);
    } catch (err) {
      console.warn('Error during download request:', err);
    }

    // Analytics tracking
    switch (format) {
      case 'csv':
        gtag('event', 'csv download click', {
          event_category: 'Download',
          event_label: 'User clicked on the CSV option in the download dropdown menu',
        });
        break;
      case 'shapefile':
        gtag('event', 'shapefile download click', {
          event_category: 'Download',
          event_label: 'User clicked on the shapefile option in the download dropdown menu',
        });
        break;
      default:
        break;
    }
  };

  const isDownloadEnabled = !isDownloadDisabledForThisList(selectedList);
  const isSourceFileDownloadEnabled =
    !isGfwList && currentUser.access_level_id !== userAccessLevel.VIEWER;

  if (!isDownloadEnabled) {
    return <></>;
  }
  const errorFileStoragePath =
    selectedList?.error_file_storage_path && selectedList.error_file_storage_path !== 'None'
      ? selectedList.error_file_storage_path
      : null;

  return (
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
          color="inherit"
          startIcon={<DownloadIcon height="14px" />}
          endIcon={isMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={handleOpenMenu}
        >
          Download
        </Button>
      )}

      <Popover anchorEl={anchorEl} open={isMenuOpen} onRequestClose={handleClose}>
        <Menu>
          {errorFileStoragePath && (
            <MenuItem
              primaryText="Download error file CSV"
              data-cy="download-error-file"
              href={`/locations/downloadErrorFile?fileKey=${errorFileStoragePath}`}
              target="_blank"
            />
          )}

          {isSourceFileDownloadEnabled && (
            <MenuItem
              primaryText="Location(s) CSV"
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
  );
}

export default ListDownloadMenu;
