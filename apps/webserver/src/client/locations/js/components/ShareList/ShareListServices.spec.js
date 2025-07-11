import {
  updateSharedListUsersService,
  addUserToSharedListService,
  removeUserFromSharedListService,
  removeAllUsersFromSharedListService,
} from './ShareListServices';

import fetch from '../../../../common/js/utils/fetch';
import { getFormattedDateTime } from '../../../../common/js/utils/dateTime';

jest.mock('../../../../common/js/utils/fetch');
jest.mock('../../../../common/js/utils/dateTime');

describe('Shared List Services', () => {
  let self;

  beforeEach(() => {
    self = {
      state: {
        selectedList: { id: 1 },
        NotAdminsOwner: [
          { user_id: 1, name: 'User1' },
          { user_id: 2, name: 'User2' },
        ],
        SharedListUsers: [],
        currentUser: { id: 3, name: 'Admin' },
      },
      setState: jest.fn(),
    };

    getFormattedDateTime.mockReturnValue('formattedDate');
  });

  it('updateSharedListUsersService should update state correctly', async () => {
    fetch.mockResolvedValue([{ user_id: 1, datetime: '2024-01-01T00:00:00Z' }]);

    await updateSharedListUsersService(self);

    expect(fetch).toHaveBeenCalledWith({
      url: '/locations/shareList/getAllUsers',
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: { list_id: 1 },
    });

    expect(self.setState).toHaveBeenCalledWith({
      NotAdminsOwner: [
        { user_id: 1, name: 'User1', timestamp: 'formattedDate', disabled: true },
        { user_id: 2, name: 'User2', disabled: false },
      ],
      listTimestamp: 'formattedDate',
      selectedList: { id: 1 },
      SharedListUsers: [{ user_id: 1, name: 'User1', timestamp: 'formattedDate', disabled: true }],
    });
  });

  it('addUserToSharedListService should update state correctly', async () => {
    fetch.mockResolvedValue({ success: true });

    const selectedUser = { id: 4, name: 'New User' };
    const updatedNotAdminsOwner = [...self.state.NotAdminsOwner, { user_id: 4, name: 'New User' }];

    await addUserToSharedListService(selectedUser, updatedNotAdminsOwner, self);

    expect(fetch).toHaveBeenCalledWith({
      url: '/locations/shareList/addUser',
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: {
        admin: { id: 3, name: 'Admin' },
        user: selectedUser,
        list: { id: 1 },
      },
    });

    expect(self.setState).toHaveBeenCalledWith({
      SharedListUsers: [],
      NotAdminsOwner: updatedNotAdminsOwner,
      addUserToSharedListDialog__isOpen: false,
    });
  });

  it('removeUserFromSharedListService should update state correctly', async () => {
    fetch.mockResolvedValue({ success: true });

    const userToRemove = { user_id: 1 };
    const updateSharedListUsers = [];
    const updatedNotAdminsOwner = [
      { user_id: 1, name: 'User1', disabled: false },
      { user_id: 2, name: 'User2', disabled: false },
    ];

    await removeUserFromSharedListService(
      userToRemove,
      updateSharedListUsers,
      updatedNotAdminsOwner,
      self
    );

    expect(fetch).toHaveBeenCalledWith({
      url: '/locations/shareList/removeUser',
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: {
        admin: { id: 3, name: 'Admin' },
        user: userToRemove,
        list: { id: 1 },
      },
    });

    expect(self.setState).toHaveBeenCalledWith({
      SharedListUsers: updateSharedListUsers,
      NotAdminsOwner: updatedNotAdminsOwner,
      userToRemove: undefined,
      removeUserFromSharedListDialog__isOpen: false,
    });
  });

  it('removeAllUsersFromSharedListService should update state correctly', async () => {
    fetch.mockResolvedValue({ success: true });

    const SharedListUsers = [
      { user_id: 1, name: 'User1' },
      { user_id: 2, name: 'User2' },
    ];
    self.state.SharedListUsers = SharedListUsers;

    await removeAllUsersFromSharedListService(self);

    expect(fetch).toHaveBeenCalledWith({
      url: '/locations/shareList/removeAllUsersFromSharedList',
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: {
        admin: { id: 3, name: 'Admin' },
        users_id: '1, 2',
        users_name: 'User1, User2',
        list: { id: 1 },
      },
    });

    expect(self.setState).toHaveBeenCalledWith({
      SharedListUsers: [],
      NotAdminsOwner: self.state.NotAdminsOwner,
      stopSharingWithAllDialog__isOpen: false,
    });
  });
});
