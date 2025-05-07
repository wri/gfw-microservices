import React, { Component } from 'react';
import IconButton from '../../../../common/js/components/IconButton';
import IconMenuDots from '../../../../common/js/components/icon/IconMenuDots';
import Divider from 'material-ui/Divider';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { locationsPage, nav } from '../../../../common/js/config';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import DeleteFolderDialog from './DeleteFolderDialog';
import RenameFolderDialog from './RenameFolderDialog';
import IconFolder from '../../../../common/js/components/icon/IconFolder';

export default class Folder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMenuOpen: false,
      isDeleteDialogOpen: false,
      isRenameDialogOpen: false,
      menuAnchorEl: undefined,
    };
  }

  closeMenu = () => {
    this.setState({ isMenuOpen: false });
  };

  render() {
    const { changeFolderView, folder } = this.props;
    return (
      <li className="folder" onClick={changeFolderView}>
        <div className="folder__title">
          <IconFolder className="folder__folder-icon" />
          {folder.name}
        </div>

        <div className="folder__controls">
          <div className="folder__count">
            {numberWithCommas(folder.lists ? folder.lists.length : 0) +
              ' ' +
              (folder.lists && folder.lists.length === 1
                ? locationsPage.lists.folderItem
                : locationsPage.lists.folderItems
              ).toLowerCase()}
          </div>
          <div className="folders-list__menu-container">
            <IconButton
              icon={<IconMenuDots />}
              title={nav.more}
              disabled={false}
              size="medium"
              variant="menu"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setState({
                  menuAnchorEl: e.currentTarget,
                  isMenuOpen: !this.state.isMenuOpen,
                });
              }}
            />
            <Popover
              anchorEl={this.state.menuAnchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              open={this.state.isMenuOpen}
              onRequestClose={this.closeMenu}
              targetOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Menu>
                <MenuItem
                  leftIcon={<DriveFileRenameOutlineIcon />}
                  primaryText={'Rename'}
                  onClick={() => {
                    this.setState({ isRenameDialogOpen: true });
                    this.closeMenu();
                  }}
                />

                {/* Only allow deletion if folder is empty */}
                {!('lists' in folder) && (
                  <>
                    <Divider />
                    <MenuItem
                      leftIcon={<DeleteIcon />}
                      primaryText={'Delete'}
                      className="MenuItem--danger"
                      onClick={() => {
                        this.setState({ isDeleteDialogOpen: true });
                        this.closeMenu();
                      }}
                    />
                  </>
                )}
              </Menu>
            </Popover>
            {/* This must be outside the menu, otherwise it will not be rendered while the menu is closed */}
            <DeleteFolderDialog
              isOpen={this.state.isDeleteDialogOpen}
              folder={folder}
              onCancel={() => this.setState({ isDeleteDialogOpen: false })}
              onComplete={(msg) => {
                this.setState({ isDeleteDialogOpen: false });
                this.props.onFolderChange(msg);
              }}
            />
            <RenameFolderDialog
              isOpen={this.state.isRenameDialogOpen}
              folder={folder}
              onCancel={() => this.setState({ isRenameDialogOpen: false })}
              onComplete={(msg) => {
                this.setState({ isRenameDialogOpen: false });
                this.props.onFolderChange(msg);
              }}
            />
          </div>
        </div>
      </li>
    );
  }
}
