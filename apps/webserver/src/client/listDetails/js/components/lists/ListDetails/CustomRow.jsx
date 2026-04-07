import { useState } from 'react';
import { Popover, MenuList, MenuItem, Button } from '@mui/material';
import { Public, Delete, DriveFileMove, QueryStats, MoreVert } from '@mui/icons-material';
import ListDownloadMenu from '../download/ListDownloadMenu';
import { updateSelectedLocations } from '../../../../../locations/js/actions/locationActions';
import redirectToMap from '../../../../../common/js/utils/redirect';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import store from '../../../../../locations/js/store';
import { ALERTS } from './listViews.constants';
import { getManualTranslation } from '../../../config/columns/columnHeaders.constants';

const transifex = (text) => {
  const raw = Transifex.live.translateText(text);
  if (raw !== text) {
    return raw;
  }
  const lang = Transifex.live.getSelectedLanguageCode?.() || 'en';
  return getManualTranslation(text, lang);
};

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
  isDeleteButtonAvailable,
  promptDeleteSelectedLocations,
  copyMoveAction,
  isCopyMoveActionAvailable,
  selectedList,
  listView,
  visibleColumns,
  currentUser,
  setIsLoading,
  style = {},
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
  const { backgroundColor, color } = style;

  const isSelectedLocationActive =
    rowInfo?.location_status_id === listStatus.Active || rowInfo?.statusCode === listStatus.Active;

  const showLocationDiagnosticButton =
    (isGfwList || isSelectedLocationActive) && listView !== ALERTS;

  return (
    <div
      data-testid="custom-row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '100%', display: 'flex', backgroundColor, color }}
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
                startIcon={<QueryStats />}
              >
                {transifex('Location diagnostic')}
              </Button>
            )}

            <Button
              onClick={() => redirectToMap(sendData)}
              startIcon={<Public />}
              sx={greenButtonStyle}
              data-cy="locations-map"
            >
              {transifex('Map')}
            </Button>

            <Button
              sx={{ minWidth: '35px', '& > svg': { margin: 0 } }}
              onClick={(e) => {
                setMenuAnchorEl(e.currentTarget);
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <MoreVert data-cy="row-more-options-button" sx={{ color: 'black' }} />
            </Button>

            <Popover
              anchorEl={menuAnchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuList>
                {isCopyMoveActionAvailable && (
                  <MenuItem
                    onClick={() => {
                      store.dispatch(updateSelectedLocations([locationId]));
                      copyMoveAction({
                        newListName: null,
                        isNewListNameDuplicate: null,
                        selectedNewOrExisting: null,
                      });
                    }}
                  >
                    <DriveFileMove sx={{ mr: 1 }} fontSize="small" />
                    {isGfwList ? transifex('Copy') : transifex('Copy/Move')}
                  </MenuItem>
                )}

                <ListDownloadMenu
                  listID={listId}
                  filters={{}}
                  listFilterStr={''}
                  tableSortedBy={'Investment Name'}
                  tableSortedDesc={true}
                  selectedList={selectedList}
                  combinedColumns={visibleColumns}
                  selectedLocations={[locationId]}
                  currentUser={currentUser}
                  listView={listView}
                  isLoading={setIsLoading}
                  isGfwList={isGfwList}
                  isHoverMenu
                />
                {isDeleteButtonAvailable && (
                  <MenuItem
                    sx={{ color: 'error.main' }}
                    onClick={() => {
                      store.dispatch(updateSelectedLocations([locationId]));
                      promptDeleteSelectedLocations();
                    }}
                  >
                    <Delete sx={{ mr: 1 }} fontSize="small" />
                    Delete
                  </MenuItem>
                )}
              </MenuList>
            </Popover>
          </div>
        )}
    </div>
  );
};

export default CustomRow;
