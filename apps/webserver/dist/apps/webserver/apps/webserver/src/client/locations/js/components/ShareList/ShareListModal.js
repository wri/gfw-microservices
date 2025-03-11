import React, { useState } from 'react';
import Dialog from 'material-ui/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import { addUserToSharedListService } from './ShareListServices';
import { getFormattedDateTime } from '../../../../common/js/utils/dateTime';
import { isAdmin, normalizeUserData, normalizeComapnyData } from '../../utils/shareList.utils';
import { B2BconnectionsList } from '../../utils/sharedListMock';
import ShareListSuccess from './ShareListModal/ShareListSuccess';
import ShareListActions from './ShareListModal/ShareListActions';
import ShareListType from './ShareListModal/ShareListType';
import ShareListOption from './ShareListModal/ShareListOption';
import { IconClose } from '../../../../common/js/components/icon/IconClose';

const ShareListModal = (props) => {
  const [selectedUser, setSelectedUser] = useState(false);
  const [filterUsersLabel, setFilterUsersLabel] = useState('');
  const [showShareType, setShowShareType] = useState('internal');
  const [shareListModalTab, setShareListModalTab] = useState('list');
  const [showActions, setShowActions] = useState(false);
  const { isOpen, onClose, selectedList, usersList, currentUser, SharedListUsers } = props;
  const [notAdminsOwner, setNotAdminsOwner] = useState([]);

  const AdminsOwner = [];
  const getNotAdminsOwner = usersList.filter((user) => {
    if (user.activated_time === null) {
      return;
    }

    user = normalizeUserData(user);

    if (selectedList.user_id === user.user_id) {
      user.accessLevelTitle = `${user.accessLevelTitle} (List Owner)`;
    }

    if (!isAdmin(user)) {
      return user;
    }

    AdminsOwner.push(user);
    return false;
  });

  console.log('here');

  setNotAdminsOwner(getNotAdminsOwner);

  const companyList = B2BconnectionsList.map((company) => {
    return normalizeComapnyData(company);
  });

  const updateShowActionsState = (value) => {
    setShowActions(!!value);
  };

  const filterCompanyList = () => {
    return companyList.filter((company) => company.name.includes(filterUsersLabel.toLowerCase()));
  };

  const handleCompanySelect = (company) => {
    setSelectedUser(company);
    setShareListModalTab('shareType');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    updateShowActionsState(user);
  };

  const intenalListIsSelect = showShareType === 'internal';

  const filterUserList = () => {
    return notAdminsOwner.filter((user) => user.label.includes(filterUsersLabel.toLowerCase()));
  };

  const setUserStates = (data) => {
    setNotAdminsOwner(data.NotAdminsOwner);
  };

  const addUserToSharedList = () => {
    selectedUser.timestamp = getFormattedDateTime();
    const updatedNotAdminsOwner = notAdminsOwner.map((user) => {
      if (user.user_id === selectedUser.user_id) {
        user.disabled = true;
      }
      return user;
    });

    const userdata = {
      state: {
        currentUser,
        selectedList,
        SharedListUsers,
      },
      setState: setUserStates,
    };

    addUserToSharedListService(selectedUser, updatedNotAdminsOwner, userdata);
    setShareListModalTab('success');
    updateShowActionsState(false);

    gtag('event', 'Add User button click', {
      event_category: 'Share List',
      event_label: `user clicked on the ok button in the modal window to start sharing list with ${selectedUser}`,
    });
  };

  const handleTypeChange = (event) => {
    setShowShareType(event.target.value);
  };

  return (
    <Dialog
      open={isOpen}
      modal={true}
      bodyClassName="share-dialog__body"
      contentClassName="dialog__content"
      onRequestClose={onClose}
    >
      <h2 className="sharelist__title">{selectedList.list_name}</h2>

      <button className="sharelist__close" onClick={onClose}>
        <IconClose />
      </button>

      {shareListModalTab === 'list' && (
        <div>
          <div className="sharelist__search">
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                value={showShareType}
                onChange={handleTypeChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value="internal">
                  <GroupsIcon />
                  <div>
                    Internal
                    <p className="sharelist__label">With your team members</p>
                  </div>
                </MenuItem>
                <MenuItem value="external">
                  <BusinessIcon />
                  <div>
                    External
                    <p className="sharelist__label">With your B2B connections</p>
                  </div>
                </MenuItem>
              </Select>
            </FormControl>
            <input
              value={filterUsersLabel}
              className="sharelist__input"
              type="text"
              onChange={(e) => {
                setFilterUsersLabel(e.target.value);
              }}
            />
          </div>

          <div className="sharelist__options">
            {intenalListIsSelect && (
              <ShareListOption
                listOpitions={filterUserList()}
                handleClick={(user) => {
                  handleUserSelect(user);
                }}
              />
            )}

            {!intenalListIsSelect && (
              <ShareListOption
                listOpitions={filterCompanyList()}
                handleClick={(company) => {
                  handleCompanySelect(company);
                }}
              />
            )}
          </div>
        </div>
      )}

      {shareListModalTab === 'shareType' && (
        <ShareListType
          handleResults={() => updateShowActionsState(true)}
          handleList={() => updateShowActionsState(true)}
          title={selectedUser.name}
        />
      )}

      {shareListModalTab === 'success' && (
        <ShareListSuccess listName={selectedList.list_name} userName={selectedUser.name} />
      )}

      {showActions && intenalListIsSelect && (
        <ShareListActions
          handleDeny={() => handleUserSelect(false)}
          handleConfirm={addUserToSharedList}
        />
      )}

      {showActions && !intenalListIsSelect && (
        <ShareListActions
          handleDeny={() => handleCompanySelect(false)}
          handleConfirm={() => setShareListModalTab('success')}
        />
      )}
    </Dialog>
  );
};

export default ShareListModal;
