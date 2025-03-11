import React, { Component } from 'react';
import { profilePage } from '../../../../common/js/config';
import Button from '../../../../common/js/components/Button';
import LinkButton from '../../../../common/js/components/LinkButton';
import IconPlus from '../../../../common/js/components/icon/IconPlus';
import IconSearch from '../../../../common/js/components/icon/IconSearch';

class UserProfileManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: this.props.users,
      filterStr: '',
    };
  }

  searchUsers = (evt) => {
    this.setState({ filterStr: evt.target.value });
  };

  createNew = () => {
    window.location.href = '/user-profile';
  };

  goToUser = (user_id) => {
    window.location.href = `/user-profile?user_id=${user_id}`;
  };

  createRow = (row, i) => {
    const {
      first_name,
      last_name,
      middle_initial,
      email,
      phone,
      title_id,
      other_title,
      access_level_id,
      status_id,
      activated_time,
      user_id,
    } = row;
    return (
      <tr key={i}>
        <td id="last_name">
          <LinkButton
            className="verify-section__back-button back-button"
            onClick={() => this.goToUser(user_id)}
            label={`${first_name} ${middle_initial} ${last_name}`}
          />
        </td>
        <td id="email" className="user-table-td">
          {email}
        </td>
        <td id="phone" className="user-table-td">
          {phone}
        </td>
        <td id="title_id" className="user-table-td">
          {title_id === 10 ? other_title : this.getTitle(title_id)}
        </td>
        <td id="access_level_id" className="user-table-td">
          {this.getAccessLevel(access_level_id)}
        </td>
        <td id="status_id" className="user-table-td">
          {status_id === 2
            ? `Activated on ${new Date(activated_time).toUTCString().replace(',', '')}`
            : this.getStatus(status_id)}
        </td>
      </tr>
    );
  };

  getStatus = (id) => {
    switch (id) {
      case 1:
        return 'Pending';
      case 2:
        return 'Active';
      case 3:
        return 'Inactive';
      default:
        return 'Inactive';
    }
  };

  getAccessLevel = (id) => {
    switch (id) {
      case 1:
        return 'Administrator';
      case 2:
        return 'Editor';
      case 3:
        return 'Viewer';
      default:
        return 'Viewer';
    }
  };

  getTitle = (id) => {
    switch (id) {
      case 1:
        return 'Analyst';
      case 2:
        return 'Chief Risk Officer';
      case 3:
        return 'Risk Officer';
      case 4:
        return 'Regional Sustainability Officer';
      case 5:
        return 'Sustainability Director';
      case 6:
        return 'Procurement';
      case 7:
        return 'Supply Chain Manager';
      case 8:
        return 'Operations';
      case 9:
        return 'Corporate Affairs Officer';
      case 10:
        return 'Other';
      default:
        return '';
    }
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
    return title.toLowerCase().indexOf(this.state.filterStr.toLowerCase()) > -1;
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
    return status.toLowerCase().indexOf(this.state.filterStr.toLowerCase()) > -1;
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
    return access.toLowerCase().indexOf(this.state.filterStr.toLowerCase()) > -1;
  };

  showLog = () => {
    window.location.href = '/activity-log';
  };

  render() {
    const filteredElements = this.state.users.filter((e) => {
      return (
        e.first_name.toLowerCase().indexOf(this.state.filterStr.toLowerCase()) > -1 ||
        e.last_name.toLowerCase().indexOf(this.state.filterStr.toLowerCase()) > -1 ||
        e.email.toLowerCase().indexOf(this.state.filterStr.toLowerCase()) > -1 ||
        this.determineTitle(e.title_id) ||
        this.determineStatus(e.status_id) ||
        this.determineAccess(e.access_level_id) ||
        e.phone.indexOf(this.state.filterStr) > -1
      );
    });
    const userRows = filteredElements.map(this.createRow);

    return (
      <section className="section-container users-section">
        <div className="users-section__action-bar">
          <div className="input-search users-section__search-input">
            <IconSearch className="input-search__icon" />
            <input
              type="search"
              className="input-search__input"
              aria-label={profilePage.profileManager.searchUsers}
              onChange={this.searchUsers}
            />
          </div>

          <Button
            className="users-section__log-button"
            onClick={this.showLog}
            label={profilePage.profileManager.viewActivityLog}
          />

          <Button
            variant="primary"
            className="users-section__action-button"
            onClick={this.createNew}
            icon={<IconPlus height="10px" />}
            label={profilePage.profileManager.createNew}
          />
        </div>

        <div className="gfw-table-container">
          <table className="gfw-table">
            <thead>
              <tr>{profilePage.profileManager.userAccountFields.map(this.createHeaders)}</tr>
            </thead>
            <tbody>{userRows}</tbody>
          </table>
        </div>
      </section>
    );
  }
}

export default UserProfileManager;
