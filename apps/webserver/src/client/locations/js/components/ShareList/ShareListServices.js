import fetch from '../../../../common/js/utils/fetch';
import { getFormattedDateTime } from '../../../../common/js/utils/dateTime';

const REQUEST_METHOD = 'POST';
const REQUEST_HEADERS = { 'Content-type': 'application/json' };

/**
 * Updating component state based on selected list and data fetched from Database Service
 * @param {Object} self - State of component `this`
 */
const updateSharedListUsersService = self => {
  const { selectedList, NotAdminsOwner } = self.state;

  fetch({
    url: '/locations/shareList/getAllUsers',
    method: REQUEST_METHOD,
    headers: REQUEST_HEADERS,
    body: {
      list_id: selectedList.id,
    },
  })
    .then(remoteSharedListUsers => {
      const SharedListUsers = [];
      const SharedListUsersIDs = remoteSharedListUsers.map(user => user.user_id);

      const updatedNotAdminsOwner = NotAdminsOwner.map(user => {
        if (SharedListUsersIDs.includes(user.user_id)) {
          const remoteSharedListUsersDateTime = remoteSharedListUsers.filter(
            remoteUser => remoteUser.user_id === user.user_id
          )[0]['datetime'];
          user['timestamp'] = getFormattedDateTime(remoteSharedListUsersDateTime);
          user['disabled'] = true;
          SharedListUsers.push(user);
        } else {
          user['disabled'] = false;
        }
        return user;
      });

      self.setState({
        NotAdminsOwner: updatedNotAdminsOwner,
        listTimestamp: getFormattedDateTime(),
        selectedList: selectedList,
        SharedListUsers: SharedListUsers,
      });
    })
    .catch(err => {
      console.log('Error when executing update Shared List Users: ', err);
    });
};

/**
 * Add user to Shared List
 * @param {Object} selectedUser - Selected user object
 * @param {Array} updatedNotAdminsOwner - Array of objects - represents current list of users NotAdminsOwner
 * @param {Object} self - State of component `this`
 */
const addUserToSharedListService = (selectedUser, updatedNotAdminsOwner, self) => {
  const { SharedListUsers, selectedList, currentUser } = self.state;

  fetch({
    url: '/locations/shareList/addUser',
    method: REQUEST_METHOD,
    headers: REQUEST_HEADERS,
    body: {
      admin: currentUser,
      user: selectedUser,
      list: selectedList,
    },
  })
    .then(response => {
      console.log(response);

      self.setState({
        SharedListUsers: SharedListUsers,
        NotAdminsOwner: updatedNotAdminsOwner,
        addUserToSharedListDialog__isOpen: false,
      });
    })
    .catch(err => {
      console.log('Error when executing add User to Shared List: ', err);
    });
};

/**
 * Remove User from Shared List
 * @param {Object} userToRemove - Selected user to Remove from Shared List
 * @param updateSharedListUsers
 * @param updatedNotAdminsOwner
 * @param {Object} self - State of component `this`
 */
const removeUserFromSharedListService = (
  userToRemove,
  updateSharedListUsers,
  updatedNotAdminsOwner,
  self
) => {
  const { selectedList, currentUser } = self.state;

  fetch({
    url: '/locations/shareList/removeUser',
    method: REQUEST_METHOD,
    headers: REQUEST_HEADERS,
    body: {
      admin: currentUser,
      user: userToRemove,
      list: selectedList,
    },
  })
    .then(response => {
      console.log(response);

      self.setState({
        SharedListUsers: updateSharedListUsers,
        NotAdminsOwner: updatedNotAdminsOwner,
        userToRemove: undefined,
        removeUserFromSharedListDialog__isOpen: false,
      });
    })
    .catch(err => {
      console.log('Error when executing remove User From Shared List: ', err);
    });
};

/**
 * Remove All Users from Shared List
 * @param {Object} self - State of component `this`
 */
const removeAllUsersFromSharedListService = (self) => {
  const { selectedList, NotAdminsOwner, SharedListUsers, currentUser } = self.state;
  const allSharedListUsersID = SharedListUsers.map(user => user.user_id).join(', ');
  const allSharedListUsersName = SharedListUsers.map(user => user.name).join(', ');

  fetch({
    url: '/locations/shareList/removeAllUsersFromSharedList',
    method: REQUEST_METHOD,
    headers: REQUEST_HEADERS,
    body: {
      admin: currentUser,
      users_id: allSharedListUsersID,
      users_name: allSharedListUsersName,
      list: selectedList,
    },
  })
    .then(response => {
      console.log(response);

      const updatedNotAdminsOwner = NotAdminsOwner.map(user => {
        if (allSharedListUsersID.includes(user.user_id)) {
          user['disabled'] = false;
          return user;
        } else {
          return user;
        }
      });

      self.setState({
        SharedListUsers: [],
        NotAdminsOwner: updatedNotAdminsOwner,
        stopSharingWithAllDialog__isOpen: false,
      });
    })
    .catch(err => {
      console.log('Error when executing remove User From Shared List: ', err);
    });
};

export {
  updateSharedListUsersService,
  addUserToSharedListService,
  removeUserFromSharedListService,
  removeAllUsersFromSharedListService,
};
