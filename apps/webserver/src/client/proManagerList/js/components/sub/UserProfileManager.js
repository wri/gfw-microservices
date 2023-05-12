import React, { Component } from 'react';
import { profilePage } from '../../../../common/js/config';

export default class UserProfileManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: this.props.users,
      filterStr: '',
      userSortingCategory: 'first_name',
      userDir: 'des',
    };
  }

  searchUsers = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  createRow = (row, i) => {
    let statusString = 'Pending';
    let accessString = '';
    this.props.statusData.forEach((status) => {
      if (status.id === row.user_status_id) {
        statusString = status.status_name;
      }
    });
    this.props.accessData.forEach((access) => {
      if (access.id === row.access_level_id) {
        accessString = access.accesslevel_name;
      }
    });
    const userName = row.first_name + ' ' + row.last_name;
    return (
      <tr key={i}>
        <td key={i}>{userName}</td>
        <td key={i + 1}>{row.email}</td>
        <td key={i + 2}>Sharing</td>
        <td key={i + 3}>{accessString}</td>
        <td key={i + 4}>{statusString}</td>
      </tr>
    );
  };

  createHeaders = (headerName, i) => {
    return <th key={i}>{headerName}</th>;
  };

  determineTitle = (titleId) => {
    let title;
    switch (titleId) {
      case 1:
        title = 'Analyst';
        break;
      case 2:
        title = 'Chief Risk Officer';
        break;
      case 3:
        title = 'Risk Officer';
        break;
      case 4:
        title = 'Regional Sustainability Officer';
        break;
      case 5:
        title = 'Sustainability Director';
        break;
      case 6:
        title = 'Procurement';
        break;
      case 7:
        title = 'Supply Chain Manager';
        break;
      case 8:
        title = 'Operations';
        break;
      case 9:
        title = 'Corporate Affairs Officer';
        break;
      case 10:
        title = 'Other';
        break;
      default:
        break;
    }
    return title.toLowerCase().includes(this.state.filterStr.toLowerCase());
  };

  determineStatus = (statusId) => {
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
    return status.toLowerCase().includes(this.state.filterStr.toLowerCase());
  };

  determineAccess = (accessId) => {
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
    return access.toLowerCase().includes(this.state.filterStr.toLowerCase());
  };

  getStatusString = (user) => {
    let statusString = 'Pending';
    this.props.statusData.forEach((status) => {
      if (status.id === user.user_status_id) {
        statusString = status.status_name;
      }
    });
    return statusString;
  };
  getAccessString = (user) => {
    let accessString = '';
    this.props.accessData.forEach((access) => {
      if (access.id === user.access_level_id) {
        accessString = access.accesslevel_name;
      }
    });
    return accessString;
  };

  sortUsers = (filteredUsers) => {
    const sortedUser = filteredUsers.sort((a, b) => {
      const aValue = a;
      const bValue = b;
      if (this.state.userSortingCategory === 'accesslevel_name') {
        aValue.accesslevel_name = this.getAccessString(aValue);
        bValue.accesslevel_name = this.getAccessString(bValue);
      } else if (this.state.userSortingCategory === 'status_name') {
        aValue.status_name = this.getStatusString(aValue);
        bValue.status_name = this.getStatusString(bValue);
      }
      if (this.state.userDir === 'asc') {
        if (aValue[this.state.userSortingCategory] < bValue[this.state.userSortingCategory]) {
          return -1;
        } else if (aValue[this.state.userSortingCategory] > bValue[this.state.userSortingCategory]) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (aValue[this.state.userSortingCategory] < bValue[this.state.userSortingCategory]) {
          return 1;
        } else if (aValue[this.state.userSortingCategory] > bValue[this.state.userSortingCategory]) {
          return -1;
        } else {
          return 0;
        }
      }
    });
    return sortedUser;
  };

  sortUserTable = (evt) => {
    const direction = this.state.userDir === 'des' ? 'asc' : 'des';
    this.setState({
      userSortingCategory: evt.target.title,
      userDir: direction,
    });
  };

  render() {
    const filteredElements = this.props.users.filter((e) => {
      return (
        e.first_name.toLowerCase().includes(this.state.filterStr.toLowerCase()) ||
        e.last_name.toLowerCase().includes(this.state.filterStr.toLowerCase()) ||
        e.email.toLowerCase().includes(this.state.filterStr.toLowerCase()) ||
        this.determineTitle(e.title_id) ||
        this.determineStatus(e.user_status_id) ||
        this.determineAccess(e.access_level_id) ||
        e.phone.includes(this.state.filterStr)
      );
    });

    const sortedFilteredUsers = this.sortUsers(filteredElements);
    const userRows = sortedFilteredUsers.map(this.createRow);

    return (
      <section className="section-container border-top">
        <h2 className="section-title-normal">{profilePage.profileManager.userProfiles}</h2>
        <div className="space-element">
          <input
            className="profile-manager-search"
            onChange={this.searchUsers}
            placeholder={profilePage.profileManager.searchUsers}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th
                className="sortable-table-header"
                title="first_name"
                onClick={(evt) => {
                  this.sortUserTable(evt);
                }}
              >
                User Name
                <div
                  className={`sortable-carrot ${
                    this.state.userSortingCategory === 'first_name' && this.state.userDir === 'asc'
                      ? 'active-asc'
                      : this.state.userSortingCategory === 'first_name' && this.state.userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                ></div>
              </th>
              <th
                className="sortable-table-header"
                title="email"
                onClick={(evt) => {
                  this.sortUserTable(evt);
                }}
              >
                E-mail
                <div
                  className={`sortable-carrot ${
                    this.state.userSortingCategory === 'email' && this.state.userDir === 'asc'
                      ? 'active-asc'
                      : this.state.userSortingCategory === 'email' && this.state.userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                ></div>
              </th>
              <th
                className="sortable-table-header"
                title="sharing"
                onClick={(evt) => {
                  this.sortUserTable(evt);
                }}
              >
                Sharing
                <div
                  className={`sortable-carrot ${
                    this.state.userSortingCategory === 'sharing' && this.state.userDir === 'asc'
                      ? 'active-asc'
                      : this.state.userSortingCategory === 'sharing' && this.state.userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                ></div>
              </th>
              <th
                className="sortable-table-header"
                title="accesslevel_name"
                onClick={(evt) => {
                  this.sortUserTable(evt);
                }}
              >
                Access Level
                <div
                  className={`sortable-carrot ${
                    this.state.userSortingCategory === 'accesslevel_name' && this.state.userDir === 'asc'
                      ? 'active-asc'
                      : this.state.userSortingCategory === 'accesslevel_name' && this.state.userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                ></div>
              </th>
              <th
                className="sortable-table-header"
                title="status_name"
                onClick={(evt) => {
                  this.sortUserTable(evt);
                }}
              >
                User Status
                <div
                  className={`sortable-carrot ${
                    this.state.userSortingCategory === 'status_name' && this.state.userDir === 'asc'
                      ? 'active-asc'
                      : this.state.userSortingCategory === 'status_name' && this.state.userDir === 'des'
                      ? 'active-des'
                      : ''
                  }`}
                ></div>
              </th>
            </tr>
          </thead>
          <tbody>{userRows}</tbody>
        </table>
      </section>
    );
  }
}
