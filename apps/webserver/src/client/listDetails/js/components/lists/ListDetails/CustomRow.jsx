import { useState } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import PublicIcon from '@mui/icons-material/Public';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import Button from '@mui/material/Button';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ListDownloadMenu from '../download/ListDownloadMenu';
import { updateSelectedLocations } from '../../../../../locations/js/actions/locationActions';
import redirectToMap from '../../../../../common/js/utils/redirect';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import store from '../../../../../locations/js/store';

const transifex = Transifex.live.translateText;

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
  isEditActionAvailable,
  editList,
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
    rowInfo?.analysisStatusId === listStatus.Active || rowInfo?.statusCode === listStatus.Active;

  const showLocationDiagnosticButton = isGfwList || isSelectedLocationActive;

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
                startIcon={<QueryStatsIcon />}
              >
                {transifex('Location diagnostic')}
              </Button>
            )}

            <Button
              onClick={() => redirectToMap(sendData)}
              startIcon={<PublicIcon />}
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
              <MoreVertIcon data-cy="row-more-options-button" sx={{ color: 'black' }} />
            </Button>

            <Popover
              anchorEl={menuAnchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={isMenuOpen}
              onRequestClose={() => setIsMenuOpen(false)}
              targetOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Menu className="context-menu">
                {isCopyMoveActionAvailable && (
                  <MenuItem
                    primaryText={isGfwList ? 'COPY' : 'COPY/MOVE'}
                    leftIcon={<DriveFileMoveIcon />}
                    onClick={() => {
                      store.dispatch(updateSelectedLocations([locationId]));
                      copyMoveAction({
                        newListName: null,
                        isNewListNameDuplicate: null,
                        selectedNewOrExisting: null,
                      });
                    }}
                  />
                )}
                {isEditActionAvailable && (
                  <MenuItem
                    primaryText="EDIT"
                    leftIcon={<EditIcon />}
                    onClick={() => {
                      store.dispatch(updateSelectedLocations([locationId]));
                      editList();
                    }}
                  />
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
                    primaryText="DELETE"
                    leftIcon={<DeleteIcon />}
                    style={{ color: 'red' }}
                    onClick={() => {
                      store.dispatch(updateSelectedLocations([locationId]));
                      promptDeleteSelectedLocations();
                    }}
                  />
                )}
              </Menu>
            </Popover>
          </div>
        )}
    </div>
  );
};

export default CustomRow;
