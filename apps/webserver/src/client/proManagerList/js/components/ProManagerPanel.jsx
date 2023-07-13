import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import UsersListSection from './sub/UsersListSection';
import AccountsListSection from './sub/AccountsListSection';
import ProfileSideBar from '../../../profile/js/ProfileSideBar';
import { proManagerListTabs } from '../../../profile/js/profileTabs';
import '../../../profile/js/Profile.scss';

function ProManagerPanel({ location }) {
  const [isLoading, setIsLoading] = useState(true);

  const defaultTab = proManagerListTabs.accountProfiles.id;
  const selectedTab = new URLSearchParams(location.search).get('tab') || defaultTab;
  const organizationId = parseInt(new URLSearchParams(location.search).get('organizationId'), 10);
  const userId = parseInt(new URLSearchParams(location.search).get('userId'), 10);
  const organizationName = new URLSearchParams(location.search).get('organizationName');


  const setSelectedTab = (tab) => {
    window.location.href = `/pro-manager-list?tab=${tab}`;
  };

  return (
    <div className="profile">
      <div className="profile__container">
        <ProfileSideBar
          tabOptions={proManagerListTabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          userAccessLevel={1}
        />
        <div className="profile__content">
          {isLoading && (
            <div
              style={{
                display: 'flex',
                width: '100vw',
                height: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress color="success" />
            </div>
          )}
          {selectedTab === proManagerListTabs.accountProfiles.id && (
            <AccountsListSection setIsLoading={setIsLoading} isLoading={isLoading} organizationId={organizationId} organizationName={organizationName}/>
          )}
          {selectedTab === proManagerListTabs.userProfiles.id && (
            <UsersListSection setIsLoading={setIsLoading} isLoading={isLoading} organizationId={organizationId} userId={userId} />
          )}
        </div>
      </div>
    </div>
  );
}

export default withRouter(ProManagerPanel);
