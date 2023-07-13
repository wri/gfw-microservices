import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import UserProfile from './UserProfile';
import UsersListTable from './UsersListTable';
import '../../../css/proManagerList.scss';

function UsersListSection({ isLoading, setIsLoading }) {
  const [userFilterStr, setUserFilterStr] = useState('');
  const [userSortingCategory, setUserSortingCategory] = useState('first_name');
  const [userDir, setUserDir] = useState('des');
  const [promanagerData, setPromanagerData] = useState({});

  useEffect(() => {
    fetch('/pro-manager-list-data', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPromanagerData(data);
        console.log(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const {
    allAccountsList,
    users,
    classes,
    commoditiesData,
    geographiesData,
    titlesData,
    statusData,
    accessData,
    policyList,
    selectedUser, // ??
  } = promanagerData;

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
    const userName = `${user.first_name} ${user.last_name}`;
    userRows.push(
      <tr key={user.organization_id}>
        <td
          title={`${user.user_id}${user.organization_id}`}
          className="pro-manager-table-link"
          onClick={() => {
            window.location.href = `/pro-manager-list?tab=users&userId=${user.user_id}&organizationId=${user.organization_id}`;
          }}
        >
          {userName}
        </td>
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
    let status;
    switch (statusId) {
      case 1:
        status = 'Pending';
        break;
      case 2:
        status = 'Active';
        break;
      case 3:
        status = 'Inactive';
        break;
      default:
        break;
    }
    return status.toLowerCase().includes(userFilterStr.toLowerCase());
  };

  const determineAccess = (accessId) => {
    let access;
    switch (accessId) {
      case 1:
        access = 'Administrator';
        break;
      case 2:
        access = 'Editor';
        break;
      case 3:
        access = 'Viewer';
        break;
      default:
        break;
    }
    return access.toLowerCase().includes(userFilterStr.toLowerCase());
  };

  const sortUserTable = (evt) => {
    const direction = userDir === 'des' ? 'asc' : 'des';
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
      {!selectedUser && !isLoading && (
        <UsersListTable
          userSortingCategory={userSortingCategory}
          userDir={userDir}
          usersList={getUserLists()}
          sortUserTable={sortUserTable}
          searchUsers={searchUsers}
        />
      )}

      {selectedUser && !isLoading && (
        <UserProfile
          userOnly
          classificationsData={classes}
          commoditiesData={commoditiesData}
          geographiesData={geographiesData}
          titlesData={titlesData}
          currentUser={selectedUser}
          disable={selectedUser.org_status !== 1}
        />
      )}
    </>
  );
}

export default UsersListSection;
