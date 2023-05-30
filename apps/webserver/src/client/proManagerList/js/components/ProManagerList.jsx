/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import Dialog from 'material-ui/Dialog';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Page from '../../../common/js/components/Page';
import AccountProfile from './sub/AccountProfile';
import UserProfile from './sub/UserProfile';
import ListOfUsersAndAccounts from './sub/ListOfUsersAndAccounts';
import { GFWLists } from '../../config/GFWLists';
import GfwButton from '../../../common/js/components/GfwButton';
import Button from '../../../common/js/components/Button';
import httpRequest from '../../../common/js/utils/httpRequest';
import '../../css/proManagerList.scss';

const pageOptions = {
  links: {
    logout: true,
  },
};

class proManagerList extends Component {
  constructor(props) {
    super(props);
    const selectedAccount = this.getAccounFromQuery();
    const selectedUser = this.getUserFromQuery();

    this.state = {
      acctFilterStr: '',
      userFilterStr: '',
      accountSortingCategory: 'organization_name',
      accountDir: 'des',
      userSortingCategory: 'first_name',
      userDir: 'des',
      GFWlistContainer: false,
      listChecked: [],
      openListMenu: false,
      selectedAccount,
      selectedUser,
    };
  }

  getUserFromQuery = () => {
    const { location, allAccountsList, allUsersList } = this.props;
    const userId = parseInt(new URLSearchParams(location.search).get('userId'), 10);
    const organizationId = parseInt(new URLSearchParams(location.search).get('organizationId'), 10);
    const selectedUser = allUsersList.find(
      (user) => user.user_id === userId && user.organization_id === organizationId
    );

    if (selectedUser) {
      const selectedOrganization = allAccountsList.find(
        (account) => account.organization_id === organizationId
      );
      selectedUser.org_status = selectedOrganization.organization_status_id;
    }

    return selectedUser;
  };

  getAccounFromQuery = () => {
    const { location, allAccountsList } = this.props;
    const organizationId = parseInt(new URLSearchParams(location.search).get('organizationId'), 10);
    const organizationName = new URLSearchParams(location.search).get('organizationName');
    const selectedAccount = allAccountsList.find(
      (account) =>
        account.organization_id === organizationId && account.organization_name === organizationName
    );
    return selectedAccount;
  };

  // This will perform the action to deactivate all accounts and essentially deactivate GFW Pro platform
  toggleGFWLists = () => {
    const { GFWlistContainer } = this.state;
    this.setState({ GFWlistContainer: !GFWlistContainer });
  };

  findPendingDateString = (account) => {
    let dateString = null;
    if (account.organization_status_id === 1 && account.organization_activated_time) {
      const date = new Date(account.organization_activated_time);
      dateString = `${date.toUTCString().replace(',', '')}`;
    }
    return dateString;
  };

  findActiveDateString = (account) => {
    let dateString = null;
    if (account.organization_status_id === 2 && account.organization_activated_time) {
      const date = new Date(account.organization_activated_time);
      dateString = `${date.toUTCString().replace(',', '')}`;
    }
    return dateString;
  };

  findStatusString = (account) => {
    const { statusData } = this.props;
    const statusString = statusData.find(
      (status) => status.id === account.organization_status_id
    ).status_name;
    return statusString;
  };

  findClassString = (account) => {
    const { classes } = this.props;
    const classString = [];
    classes.forEach((classType) => {
      if (account.organization_classifications_ids?.indexOf(classType.id) > -1) {
        classString.push(classType.classification_name);
      }
    });
    const classArray = [];
    classString.forEach((string, i) => {
      if (i === classString.length - 1) {
        classArray.push(<div key={`${account.organization_id}-${string}`}>{string}</div>);
      } else {
        classArray.push(<div key={`${account.organization_id}-${string}`}>{string},</div>);
      }
    });
    return classArray;
  };

  createAccountsList = (account) => {
    const accountRows = [];
    const pendingDateString = this.findPendingDateString(account);
    const activeDateString = this.findActiveDateString(account);
    const statusString = this.findStatusString(account);
    const classString = this.findClassString(account);
    if (account.organization_website.indexOf('http') === -1) {
      // eslint-disable-next-line no-param-reassign
      account.organization_website = `https://${account.organization_website}`;
    }
    accountRows.push(
      <tr key={account.organization_id}>
        <td
          className="pro-manager-table-link"
          onClick={() => {
            window.location.href = `/pro-manager-list?organizationId=${account.organization_id}&organizationName=${account.organization_name}`;
          }}
        >
          {account.organization_name}
        </td>
        <td>{account.organization_parent}</td>
        <td>{account.organization_address}</td>
        <td>
          <a href={account.organization_website} target="_blank" rel="noreferrer">
            {account.organization_website}
          </a>
        </td>
        <td>{classString}</td>
        <td>{statusString}</td>
        <td>{pendingDateString}</td>
        <td>{activeDateString}</td>
      </tr>
    );
    return accountRows;
  };

  getStatusString = (user) => {
    const { statusData } = this.props;
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

  getAccessString = (user) => {
    const { accessData } = this.props;
    let accessString = '';
    accessData.forEach((access) => {
      if (access.id === user.access_level_id) {
        accessString = access.accesslevel_name;
      }
    });
    return accessString;
  };

  createUsersList = (user) => {
    const userRows = [];
    // TODO: add sharing to list!!
    const statusString = this.getStatusString(user);
    const accessString = this.getAccessString(user);
    const userName = `${user.first_name} ${user.last_name}`;
    userRows.push(
      <tr key={user.organization_id}>
        <td
          title={`${user.user_id}${user.organization_id}`}
          className="pro-manager-table-link"
          onClick={() => {
            window.location.href = `/pro-manager-list?userId=${user.user_id}&organizationId=${user.organization_id}`;
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

  searchAccts = (evt) => {
    this.setState({ acctFilterStr: evt.target.value });
  };

  searchUsers = (evt) => {
    this.setState({ userFilterStr: evt.target.value });
  };

  determineStatus = (statusId) => {
    const { userFilterStr } = this.state;
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

  determineAccess = (accessId) => {
    const { userFilterStr } = this.state;
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

  determineOrgClass = (orgClasses) => {
    const { acctFilterStr } = this.state;
    if (orgClasses) {
      let valid = false;
      const classes = orgClasses.split(',');
      classes.forEach((orgClass) => {
        let classText;
        switch (parseInt(orgClass, 10)) {
          case 1:
            classText = 'Commercial Bank';
            break;
          case 2:
            classText = 'Consumer Goods Manufacturer';
            break;
          case 3:
            classText = 'Development Finance Institution';
            break;
          case 4:
            classText = 'Governmental Organization';
            break;
          case 5:
            classText = 'Investment Fund';
            break;
          case 6:
            classText = 'NGO';
            break;
          case 7:
            classText = 'Producer';
            break;
          case 8:
            classText = 'Retailer';
            break;
          case 9:
            classText = 'Processor/Trader';
            break;
          case 10:
            classText = 'Service Provider';
            break;
          default:
            break;
        }

        if (classText.toLowerCase().includes(acctFilterStr.toLowerCase())) {
          valid = true;
        }
      });
      return valid;
    }
    return false;
  };

  determineOrgStatus = (statusId) => {
    const { acctFilterStr } = this.state;
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
    return status.toLowerCase().includes(acctFilterStr.toLowerCase());
  };

  sortAcctTable = (evt) => {
    const { accountDir } = this.state;
    const direction = accountDir === 'des' ? 'asc' : 'des';
    this.setState({
      accountSortingCategory: evt.target.title,
      accountDir: direction,
    });
  };

  sortUserTable = (evt) => {
    const { userDir } = this.state;
    const direction = userDir === 'des' ? 'asc' : 'des';
    this.setState({
      userSortingCategory: evt.target.title,
      userDir: direction,
    });
  };

  sortAccounts = (filteredAccts) => {
    const { accountSortingCategory, accountDir } = this.state;
    const sortedAccounts =
      accountSortingCategory === 'pendingDateString' ||
      accountSortingCategory === 'activeDateString'
        ? _.orderBy(
            filteredAccts,
            (acct) => new Date(acct.organization_activated_time),
            accountDir === 'asc' ? 'asc' : 'desc'
          )
        : filteredAccts.sort((a, b) => {
            const aValue = a;
            const bValue = b;
            if (accountSortingCategory === 'classString') {
              aValue.classString = this.findClassString(aValue);
              bValue.classString = this.findClassString(bValue);
            } else if (accountSortingCategory === 'statusString') {
              aValue.classString = this.findStatusString(aValue);
              bValue.classString = this.findStatusString(bValue);
            }
            if (accountDir === 'asc') {
              if (aValue[accountSortingCategory] < bValue[accountSortingCategory]) {
                return -1;
              }
              if (aValue[accountSortingCategory] > bValue[accountSortingCategory]) {
                return 1;
              }
              return 0;
            }
            if (aValue[accountSortingCategory] < bValue[accountSortingCategory]) {
              return 1;
            }
            if (aValue[accountSortingCategory] > bValue[accountSortingCategory]) {
              return -1;
            }
            return 0;
          });
    return sortedAccounts;
  };

  sortUsers = (filteredUsers) => {
    const { userSortingCategory, userDir } = this.state;
    const sortedUser = filteredUsers.sort((a, b) => {
      const aValue = a;
      const bValue = b;
      if (userSortingCategory === 'accesslevel_name') {
        aValue.accesslevel_name = this.getAccessString(aValue);
        bValue.accesslevel_name = this.getAccessString(bValue);
      } else if (userSortingCategory === 'status_name') {
        aValue.status_name = this.getStatusString(aValue);
        bValue.status_name = this.getStatusString(bValue);
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

  updateCheck = (id) => {
    const { listChecked } = this.state;
    const tempColumns = listChecked.slice();
    const index = tempColumns.indexOf(id);
    if (index === -1) {
      tempColumns.push(id);
    } else {
      tempColumns.splice(index, 1);
    }
    this.setState({
      listChecked: tempColumns,
    });
  };

  toggleListMenu = (event) => {
    event.preventDefault();

    this.setState({
      openListMenu: true,
      anchorElListMenu: event.currentTarget,
    });
  };

  closeListMenu = () => {
    this.setState({
      openListMenu: false,
      listChecked: [],
    });
  };

  createUpdateCheckbox = (list) => {
    const { listChecked } = this.state;
    const { name, id } = list;
    return name === 'Administrative Areas' || name === 'Protected Areas' ? null : (
      <div key={id} className="checkbox">
        <input
          id={`checkBox-${list.id}`}
          checked={listChecked.indexOf(list.id) > -1}
          onChange={() => this.updateCheck(list.id)}
          type="checkbox"
        />
        <label htmlFor={`checkBox-${list.id}`}>{list.name}</label>
      </div>
    );
  };

  updateGFWLists = () => {
    const { listChecked } = this.state;
    console.log('LISTS TO UPDATE', listChecked);
    this.closeListMenu();
    httpRequest
      .fetchJSON('/pro-manager/gfwlists', { list_ids: listChecked })
      .then((response) => {
        console.log('response', response);
        if (response === 'success') {
          this.toggleGFWLists();
        } else {
          console.log('error in sending gfw lists');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    const {
      accessData,
      allAccountsList,
      allUsersList,
      classes,
      commoditiesData,
      geographiesData,
      policyList,
      statusData,
      titlesData,
    } = this.props;
    const {
      accountDir,
      accountSortingCategory,
      acctFilterStr,
      anchorElListMenu,
      GFWlistContainer,
      listChecked,
      openListMenu,
      userDir,
      userFilterStr,
      userSortingCategory,
      selectedAccount,
      selectedUser,
    } = this.state;

    const displayLists = GFWLists.map(this.createUpdateCheckbox);

    const filteredAccts = allAccountsList.filter((e) => {
      return (
        e.organization_name.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        e.organization_parent.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        e.organization_address.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        e.organization_website.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        this.determineOrgClass(e.organization_classifications_ids) ||
        this.determineOrgStatus(e.organization_status_id) ||
        e.organization_name.toLowerCase().includes(acctFilterStr.toLowerCase())
      );
    });
    const sortedFilteredAccounts = this.sortAccounts(filteredAccts);

    const accountsList = sortedFilteredAccounts.map(this.createAccountsList);
    const filteredUsers = allUsersList.filter((e) => {
      return (
        e.first_name.toLowerCase().includes(userFilterStr.toLowerCase()) ||
        e.last_name.toLowerCase().includes(userFilterStr.toLowerCase()) ||
        e.email.toLowerCase().includes(userFilterStr.toLowerCase()) ||
        this.determineStatus(e.user_status_id) ||
        this.determineAccess(e.access_level_id) ||
        e.organization_name.toLowerCase().includes(userFilterStr.toLowerCase())
      );
    });

    const sortedFilteredUsers = this.sortUsers(filteredUsers);
    const usersList = sortedFilteredUsers.map(this.createUsersList);

    const listAction = [
      <Button variant="primary" label="Ok" keyboardFocused onClick={this.toggleGFWLists} />,
    ];
    const showListOfUsersAndAccounts = !selectedAccount && !selectedUser;

    return (
      <Page links={pageOptions.links} active="pro-manager">
        <Dialog
          paperClassName="dialog-paper"
          title="Updating GFW Lists"
          actions={listAction}
          modal={false}
          open={GFWlistContainer}
          onRequestClose={this.toggleGFWLists}
          autoScrollBodyContent
        >
          <p>Note: This process may take a long time.</p>
        </Dialog>
        <Popover
          open={openListMenu}
          anchorEl={anchorElListMenu}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.closeListMenu}
        >
          <Menu style={{ padding: '10px' }}>
            {displayLists}
            <GfwButton
              classNames={`btn-green ${listChecked.length === 0 ? 'button-disabled' : ''}`}
              onClick={() => (listChecked.length === 0 ? null : this.updateGFWLists())}
              value="Update Selected"
            />
          </Menu>
        </Popover>
        {showListOfUsersAndAccounts && (
          <ListOfUsersAndAccounts
            accountSortingCategory={accountSortingCategory}
            accountDir={accountDir}
            accountsList={accountsList}
            userSortingCategory={userSortingCategory}
            userDir={userDir}
            usersList={usersList}
            sortUserTable={this.sortUserTable}
            toggleListMenu={this.toggleListMenu}
            searchAccts={this.searchAccts}
            sortAcctTable={this.sortAcctTable}
            searchUsers={this.searchUsers}
          />
        )}

        {selectedAccount && (
          <AccountProfile
            users={allUsersList}
            currentAccount={selectedAccount}
            classificationsData={classes}
            statusData={statusData}
            accessData={accessData}
            disable={selectedAccount.organization_status_id !== 1}
            policyList={policyList}
          />
        )}

        {selectedUser && (
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
      </Page>
    );
  }
}

export default withRouter(proManagerList);
