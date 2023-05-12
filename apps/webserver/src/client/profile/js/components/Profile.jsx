import React, { Component } from 'react';
import Page from '../../../common/js/components/Page';
import store from '../store';
import AccountProfile from './sub/AccountProfile';
import '../../css/profile.scss';

import { saveUsers } from '../actions/profileActions';

const pageOptions = {
  links: {
    logout: true,
  },
};

export default class Profile extends Component {
  constructor(props) {
    super(props);
    const { users, userInfo, organization } = props;
    store.dispatch(saveUsers(users));

    const initialState = store.getState();

    if (!users.length) {
      window.location.href = `/user-profile?user_id=${userInfo.id}`;
    }

    if (userInfo.length > 0) {
      initialState.currentUser = [userInfo];
    } else if (typeof userInfo === 'object' && Object.keys(userInfo).length > 0) {
      initialState.currentUser = userInfo;
    }
    if (organization.organization_name) {
      initialState.currentAccount = organization;
    }
    this.state = initialState;
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(this.storeDidUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  storeDidUpdate = () => {
    this.setState({ ...store.getState() });
  };

  render() {
    const { currentUser, currentAccount, organizationUsers } = this.state;
    const { users, classificationsData, policyList } = this.props;
    return (
      <Page links={pageOptions.links} active="profile">
        <div className="profile-page">
          {users.length > 0 ? (
            <AccountProfile
              users={organizationUsers}
              currentAccount={currentAccount}
              classificationsData={classificationsData}
              currentUser={currentUser}
              policyList={policyList}
            />
          ) : null}
        </div>
      </Page>
    );
  }
}
