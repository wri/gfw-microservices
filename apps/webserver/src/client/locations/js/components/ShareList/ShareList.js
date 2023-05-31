import React from 'react';
import Select from 'react-select';
import { getFormattedDateTime } from '../../../../common/js/utils/dateTime';
import ShareListDialog from './ShareListDialog';
import {
  updateSharedListUsersService,
  addUserToSharedListService,
  removeUserFromSharedListService,
  removeAllUsersFromSharedListService,
} from './ShareListServices';
import './ShareList.scss';
import Button from '../../../../common/js/components/Button';
import IconPlus from '../../../../common/js/components/icon/IconPlus';

const ADMIN_ACCESS_LEVEL = 1;

const getAccessLevelTitle = function (shareUser) {
  let userTitle;
  switch (shareUser.access_level_id) {
    case 1:
      userTitle = 'Administrator';
      break;
    case 2:
      userTitle = 'Editor';
      break;
    case 3:
      userTitle = 'Viewer';
      break;
    default:
      return false;
  }
  return userTitle;
};

class ShareList extends React.Component {
  constructor(props) {
    super(props);
    const selectedList = props.selectedList;

    const AdminsOwner = [];
    const NotAdminsOwner = props.usersList
      .map((user) => {
        // Adding disabled, value and label object properties for each user
        // in order to match `React Select` library default settings
        user['disabled'] = false;
        user['value'] = user.email;
        user['label'] = `${user.first_name} ${user.last_name} - ${user.email}`;
        user['name'] = `${user.first_name} ${user.last_name}`;
        user['accessLevelTitle'] = getAccessLevelTitle(user);
        return user;
      })
      .filter((user) => {
        if (user.activated_time !== null) {
          if (
            user.access_level_id !== ADMIN_ACCESS_LEVEL &&
            selectedList.user_id !== user.user_id
          ) {
            return user;
          } else if (selectedList.user_id === user.user_id) {
            user['accessLevelTitle'] = `${getAccessLevelTitle(user)} (List Owner)`;
            AdminsOwner.push(user);
            return false;
          } else {
            AdminsOwner.push(user);
            return false;
          }
        }
      });

    this.state = {
      AdminsOwner: AdminsOwner,
      NotAdminsOwner: NotAdminsOwner,
      currentUser: props.currentUser,
      listTimestamp: getFormattedDateTime(),
      selectedList: selectedList,
      selectedUser: undefined,
      SharedListUsers: undefined,
      userToRemove: undefined,
      addUserToSharedListDialog__isOpen: false,
      removeUserFromSharedListDialog__isOpen: false,
      stopSharingWithAllDialog__isOpen: false,
    };
  }

  componentDidMount() {
    updateSharedListUsersService(this);
  }

  render() {
    const {
      selectedList,
      listTimestamp,
      SharedListUsers,
      selectedUser,
      AdminsOwner,
      NotAdminsOwner,
      userToRemove,
      addUserToSharedListDialog__isOpen,
      removeUserFromSharedListDialog__isOpen,
      stopSharingWithAllDialog__isOpen,
    } = this.state;

    const selectedUserInSharedList = selectedUser
      ? SharedListUsers.filter((user) => user.user_id === selectedUser.user_id)
      : [];

    const combinedUsersList = SharedListUsers ? AdminsOwner.concat(SharedListUsers) : AdminsOwner;

    return (
      <div className="App">
        {SharedListUsers && (
          <React.Fragment>
            <ShareListDialog
              onRequestClose={this._handleAddUserToSharedListDialogMessage}
              onButtonConfirm={this._addUserToSharedList}
              open={addUserToSharedListDialog__isOpen}
              modalTitle="Share list"
              body={
                <div className="SharedListDialog">
                  <p>
                    You are about to share <strong>{selectedList.list_name}</strong> with
                    <strong> {selectedUser && selectedUser.name}</strong>. Please confirm by
                    pressing on the OK button.
                  </p>
                </div>
              }
            />

            <ShareListDialog
              onRequestClose={this._handleRemoveUserFromSharedListDialog}
              onButtonConfirm={this._removeUserFromSharedList}
              open={removeUserFromSharedListDialog__isOpen}
              modalTitle="Discontinue sharing"
              body={
                <div className="SharedListDialog">
                  <p>
                    You are about to discontinue sharing of{' '}
                    <strong>{selectedList.list_name}</strong> with
                    <strong> {userToRemove && userToRemove.name}</strong>. Please confirm by
                    pressing on the OK button.
                  </p>
                </div>
              }
            />

            <ShareListDialog
              onRequestClose={this._handleStopSharingWithAllDialog}
              onButtonConfirm={this._removeAllUsersFromSharedList}
              open={stopSharingWithAllDialog__isOpen}
              modalTitle="Discontinue sharing"
              body={
                <div className="SharedListDialog">
                  <p>
                    You are about to discontinue sharing of{' '}
                    <strong>{selectedList.list_name}</strong> with{' '}
                    {SharedListUsers && SharedListUsers.length > 1 ? 'users' : 'user'}
                  </p>
                  <ul>
                    {SharedListUsers &&
                      SharedListUsers.map((user, key) => <li key={key}>{user.name}</li>)}
                  </ul>
                  <p>Please confirm by pressing on the OK button.</p>
                </div>
              }
            />

            <section id="SearchUsers__filter">
              <Select
                classNamePrefix="react-select"
                isClearable
                value={selectedUser}
                options={NotAdminsOwner}
                onChange={this._updateSelectedUserState}
                isOptionDisabled={(option) => option.disabled === true}
                //menuIsOpen={true}
              />
              <div className="SearchUsers__buttons">
                {selectedUser && !selectedUserInSharedList.length > 0 ? (
                  <Button
                    variant="primary"
                    className="SearchUsers__add-user"
                    onClick={() => this._handleAddUserToSharedListDialogMessage()}
                    icon={<IconPlus height="10px" />}
                    label="Add user"
                  />
                ) : (
                  <Button
                    variant="primary"
                    disabled
                    className="SearchUsers__add-user"
                    icon={<IconPlus height="10px" />}
                    label="Add user"
                  />
                )}

                {SharedListUsers.length > 0 ? (
                  <Button
                    variant="danger"
                    className="SearchUsers__remove-all-user"
                    onClick={() => this._handleStopSharingWithAllDialog()}
                    label="STOP SHARING WITH ALL"
                  />
                ) : (
                  <Button
                    variant="danger"
                    disabled
                    className="SearchUsers__remove-all-user"
                    label="STOP SHARING WITH ALL"
                  />
                )}
              </div>
            </section>

            <section id="ShareUsers__container">
              <table id="ShareUsersTable">
                <thead>
                  <tr>
                    <th className="ShareUsers__name">User Name</th>
                    <th className="ShareUsers__email">User Email</th>
                    <th className="ShareUsers__timestamp">Timestamp</th>
                    <th className="ShareUsers__access-level">Access Level</th>
                    <th className="ShareUsers__remove-user">Remove User</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedUsersList.map((user) => {
                    const userRemovable = this._isUserAdminOrOwner(user);
                    return (
                      <tr
                        key={user.email}
                        className={!userRemovable ? 'user-not-removable' : 'user-removable'}
                      >
                        <td className="ShareUsers__name">{user.name}</td>
                        <td className="ShareUsers__email">{user.email}</td>
                        <td className="ShareUsers__timestamp">
                          {user.timestamp ? user.timestamp : listTimestamp}
                        </td>
                        <td className="ShareUsers__access-level">{user.accessLevelTitle}</td>
                        <td className="ShareUsers__remove-user">
                          {userRemovable && (
                            <button
                              className="gfw-button btn-remove"
                              onClick={() => this._handleRemoveUserFromSharedListDialog(user)}
                            >
                              <svg className="svg-icon">
                                <use xlinkHref="#icon-close" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </React.Fragment>
        )}
      </div>
    );
  }

  /**
   * Handle Adding User to Shared List - Popup Dialog
   * @private
   */
  _handleAddUserToSharedListDialogMessage = () => {
    const { addUserToSharedListDialog__isOpen } = this.state;
    this.setState({
      addUserToSharedListDialog__isOpen: !addUserToSharedListDialog__isOpen,
    });
  };

  /**
   * Handle Removing User from Shared List - Popup Dialog
   * @private
   */
  _handleRemoveUserFromSharedListDialog = (userToRemove = undefined) => {
    const { removeUserFromSharedListDialog__isOpen } = this.state;
    this.setState({
      userToRemove: userToRemove,
      removeUserFromSharedListDialog__isOpen: !removeUserFromSharedListDialog__isOpen,
    });
  };

  /**
   * Handle Stop Sharing List with All Non Admins/Owner users - Popup Dialog
   * @private
   */
  _handleStopSharingWithAllDialog = () => {
    const { stopSharingWithAllDialog__isOpen } = this.state;
    this.setState({ stopSharingWithAllDialog__isOpen: !stopSharingWithAllDialog__isOpen });
  };

  /**
   * Check if user is Admin/Owner
   * @param {Object} selectedUser - Currently selected user in React Select component
   * @returns {boolean} - True if selected user is Admin/Owner
   * @private
   */
  _isUserAdminOrOwner = (selectedUser) => {
    const { AdminsOwner } = this.state;
    const listLength = AdminsOwner.filter((user) => user.user_id === selectedUser.user_id);
    return listLength.length === 0;
  };

  /**
   * Update component State with Selected User
   * @param {Object} selectedUser - Currently selected user in React Select component
   * @private
   */
  _updateSelectedUserState = (selectedUser) => {
    this.setState({ selectedUser: selectedUser });
  };

  /**
   * Add User to Shared List
   * @private
   */
  _addUserToSharedList = () => {
    const { selectedUser, NotAdminsOwner, SharedListUsers } = this.state;

    selectedUser['timestamp'] = getFormattedDateTime();
    SharedListUsers.push(selectedUser);
    const updatedNotAdminsOwner = NotAdminsOwner.map((user) => {
      if (user.user_id === selectedUser.user_id) {
        user['disabled'] = true;
      }
      return user;
    });

    addUserToSharedListService(selectedUser, updatedNotAdminsOwner, this);
    gtag('event', 'Add User button click', {
      'event_category': 'Share List',
      'event_label': `user clicked on the ok button in the modal window to start sharing list with ${selectedUser}`,
    });
  };

  /**
   * Remove user from Shared List
   * @private
   */
  _removeUserFromSharedList = () => {
    const { userToRemove, NotAdminsOwner, SharedListUsers } = this.state;

    const updateSharedListUsers = SharedListUsers.filter((user) => {
      return user.user_id !== userToRemove.user_id ? user : false;
    });

    const updatedNotAdminsOwner = NotAdminsOwner.map((user) => {
      if (user.user_id === userToRemove.user_id) {
        user['disabled'] = false;
      }
      return user;
    });

    removeUserFromSharedListService(userToRemove, updateSharedListUsers, updatedNotAdminsOwner, this);
    gtag('event', 'X button click', {
      'event_category': 'Share List',
      'event_label': `user clicked on the ok button in the modal window to stop sharing list with ${userToRemove}`,
    });
  };

  /**
   * Remove All Non Admin users from Shared List
   * @private
   */
  _removeAllUsersFromSharedList = () => {
    removeAllUsersFromSharedListService(this);
    gtag('event', 'Stop Sharing With All button click', {
      'event_category': 'Share List',
      'event_label': 'user clicked on the ok button in the modal window to stop sharing list with everyone',
    });
  };
}

export default ShareList;
