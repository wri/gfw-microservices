import { useState, MouseEvent } from 'react';
import {
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  Divider,
  Box,
  Button,
  MenuList,
  MenuItem,
  Popover,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { userAccessLevel } from '../../../../../common/js/config';
import { isDownloadDisabledForThisList } from '../../../../../locations/js/utils/lists.utils';
import ConfirmDialog from '../../../../../locations/js/components/lists/download/confirmDialog';
import downloadRequest from '../../../../../locations/js/components/lists/download/downloadRequest';
import errorLogger from '../../../../../common/js/utils/errorLogger';
import { useTransifexTranslation } from '../../../../../hooks/useTransifexTranslation';

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
  format: 'csv' | 'shapefile' | 'geojson';
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

  const labelLocationsCsv = useTransifexTranslation('Location(s) CSV');
  const labelLocationsShapefile = useTransifexTranslation('Location(s) Shapefile');
  const labelLocationsGeojson = useTransifexTranslation('Location(s) GeoJSON');
  const labelDownloadsNote = useTransifexTranslation(
    'Downloads contain location data only; no analysis'
  );
  const labelDownloadErrorFile = useTransifexTranslation('Download error file CSV');
  const labelDownload = useTransifexTranslation('Download');

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
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
        source: 'listDetails',
      });
      isLoading(false);
    } catch (err) {
      errorLogger.warn('Error during download request', {
        component: 'ListDownloadMenu',
        action: 'handleDownload',
        error: err,
        format,
      });
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
      case 'geojson':
        gtag('event', 'geojson download click', {
          event_category: 'Download',
          event_label: 'User clicked on the GeoJSON option in the download dropdown menu',
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
          data-cy="download-list"
          onClick={handleOpenMenu}
          sx={{ '.MuiListItemIcon-root': { minWidth: 0 } }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText sx={{ mx: 1 }}>{labelDownload}</ListItemText>
          <Box component="span" sx={{ display: 'flex', marginLeft: 'auto' }}>
            {isMenuOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </Box>
        </MenuItem>
      ) : (
        <Button
          data-cy="download-list"
          color="inherit"
          startIcon={<DownloadIcon fontSize="small" />}
          endIcon={
            isMenuOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
          }
          onClick={handleOpenMenu}
        >
          {labelDownload}
        </Button>
      )}

      <Popover
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuList>
          {errorFileStoragePath && (
            <MenuItem
              component="a"
              data-cy="download-error-file"
              href={`/locations/downloadErrorFile?fileKey=${errorFileStoragePath}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListItemText>{labelDownloadErrorFile}</ListItemText>
            </MenuItem>
          )}

          {isSourceFileDownloadEnabled && (
            <MenuItem
              data-cy="download-list-csv"
              onClick={() => handleMenuClick({ format: 'csv', type: 'input' })}
            >
              <ListItemText>{labelLocationsCsv}</ListItemText>
            </MenuItem>
          )}

          {isSourceFileDownloadEnabled && (
            <MenuItem
              data-cy="download-list-shapefile"
              onClick={() => handleMenuClick({ format: 'shapefile', type: 'input' })}
            >
              <ListItemText>{labelLocationsShapefile}</ListItemText>
            </MenuItem>
          )}

          {isSourceFileDownloadEnabled && (
            <MenuItem
              data-cy="download-list-geojson"
              onClick={() => handleMenuClick({ format: 'geojson', type: 'input' })}
            >
              <ListItemText>{labelLocationsGeojson}</ListItemText>
            </MenuItem>
          )}
          <Divider />
          <MenuItem>
            <Box sx={{ fontWeight: 'light', fontStyle: 'italic', fontSize: '12px' }}>
              {labelDownloadsNote}
            </Box>
          </MenuItem>
        </MenuList>
      </Popover>
      <ConfirmDialog open={dialogOpen} setDialogOpen={setDialogOpen} />
    </>
  );
}

export default ListDownloadMenu;
