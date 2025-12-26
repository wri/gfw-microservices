import { useEffect, useState } from 'react';
import UsersListTable from './UsersListTable';
import '../../../css/proManagerList.scss';
import { PRO_MANAGER_PATH } from '../../common/paths';
import { USER_STATUS_LABELS } from '../../../../../config/env/userStatuses.constants';
import errorLogger from '../../../../common/js/utils/errorLogger';

function UsersListSection({ isLoading, setIsLoading }) {
  const [userFilterStr, setUserFilterStr] = useState('');
  const [userSortingCategory, setUserSortingCategory] = useState('first_name');
  const [userDir, setUserDir] = useState('desc');
  const [promanagerData, setPromanagerData] = useState({});

  useEffect(() => {
    fetch('/pro-manager-list/users', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPromanagerData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        errorLogger.error('Error fetching users list data', {
          component: 'UsersListSection',
          action: 'fetchData',
          error,
        });
        setIsLoading(false);
      });
  }, []);

  const { users, statusData, accessData } = promanagerData;

  const getStatusString = (user) => {
    let statusString = 'Pending';
    statusData.forEach((status) => {
      if (status.id === user.user_status_id) {
        statusString = status.status_name;
      }
    });
    if (statusString === 'Active') {
      const date = new Date(user.user_activated_time);
      statusString = `Activated on ${date.toUTCString().replace(',', '')}`;
    }
    return statusString;
  };

  const getAccessString = (user) => {
    let accessString = '';
    accessData.forEach((access) => {
      if (access.id === user.access_level_id) {
        accessString = access.accesslevel_name;
      }
    });
    return accessString;
  };

  const createUsersList = (user) => {
    const userRows = [];
    // TODO: add sharing to list!!
    const statusString = getStatusString(user);
    const accessString = getAccessString(user);
    userRows.push(
      <tr key={user.organization_id}>
        <td
          title={`${user.user_id}${user.organization_id}`}
          className="pro-manager-table-link"
          onClick={() => {
            window.location.href = `${PRO_MANAGER_PATH}?tab=users&userId=${user.user_id}&organizationId=${user.organization_id}`;
          }}
        >
          {user.first_name}
        </td>
        <td>{user.last_name}</td>
        <td>{user.organization_name}</td>
        <td>{user.organization_classifications}</td>
        <td>{user.email}</td>
        <td />
        <td>{accessString}</td>
        <td>{statusString}</td>
      </tr>
    );
    return userRows;
  };

  const searchUsers = (evt) => {
    setUserFilterStr(evt.target.value);
  };

  const determineStatus = (statusId) => {
    const status = USER_STATUS_LABELS[statusId] || '';

    return status.toLowerCase().includes(userFilterStr.toLowerCase());
  };

  const determineAccess = (accessId) => {
    const access_type = {
      1: 'Administrator',
      2: 'Editor',
      3: 'Viewer',
    };
    const access = access_type[accessId] || '';

    return access.toLowerCase().includes(userFilterStr.toLowerCase());
  };

  const sortUserTable = (evt) => {
    const direction = userDir === 'desc' ? 'asc' : 'desc';
    setUserSortingCategory(evt.target.title);
    setUserDir(direction);
  };

  const sortUsers = (filteredUsers) => {
    const sortedUser = filteredUsers.sort((a, b) => {
      const aValue = a;
      const bValue = b;
      if (userSortingCategory === 'accesslevel_name') {
        aValue.accesslevel_name = getAccessString(aValue);
        bValue.accesslevel_name = getAccessString(bValue);
      } else if (userSortingCategory === 'status_name') {
        aValue.status_name = getStatusString(aValue);
        bValue.status_name = getStatusString(bValue);
      }
      if (userDir === 'asc') {
        if (aValue[userSortingCategory] < bValue[userSortingCategory]) {
          return -1;
        }
        if (aValue[userSortingCategory] > bValue[userSortingCategory]) {
          return 1;
        }
        return 0;
      }
      if (aValue[userSortingCategory] < bValue[userSortingCategory]) {
        return 1;
      }
      if (aValue[userSortingCategory] > bValue[userSortingCategory]) {
        return -1;
      }
      return 0;
    });
    return sortedUser;
  };

  const getUserLists = () => {
    const filteredUsers = users.filter((e) => {
      return (
        e.first_name.toLowerCase().includes(userFilterStr.toLowerCase()) ||
        e.last_name.toLowerCase().includes(userFilterStr.toLowerCase()) ||
        e.email.toLowerCase().includes(userFilterStr.toLowerCase()) ||
        determineStatus(e.user_status_id) ||
        determineAccess(e.access_level_id) ||
        e.organization_name.toLowerCase().includes(userFilterStr.toLowerCase())
      );
    });

    const sortedFilteredUsers = sortUsers(filteredUsers);
    const usersList = sortedFilteredUsers.map(createUsersList);
    return usersList;
  };
  return (
    <>
      {!isLoading && (
        <UsersListTable
          userSortingCategory={userSortingCategory}
          userDir={userDir}
          usersList={getUserLists()}
          sortUserTable={sortUserTable}
          searchUsers={searchUsers}
        />
      )}
    </>
  );
}

export default UsersListSection;
