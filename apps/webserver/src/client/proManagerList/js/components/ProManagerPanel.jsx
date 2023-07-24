import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import UsersListSection from './UsersListSection';
import UserDetailSection from './UserDetailSection';
import AccountsListSection from './AccountsListSection';
import AccountDetailSection from './AccountDetailSection';
import SideBarMenu from '../../../common/js/components/SideBarMenu';
import { proManagerPanelTabs } from './proManagerPanelTabs';
import './ProManagerPanel.scss';

function ProManagerPanel({ location }) {
  const [isLoading, setIsLoading] = useState(true);

  const defaultTab = proManagerPanelTabs.accountProfiles.id;
  const selectedTab = new URLSearchParams(location.search).get('tab') || defaultTab;
  const organizationId = parseInt(new URLSearchParams(location.search).get('organizationId'), 10);
  const userId = parseInt(new URLSearchParams(location.search).get('userId'), 10);
  const organizationName = new URLSearchParams(location.search).get('organizationName');

  const userDetail = userId && organizationId;
  const accountDetail = organizationName && organizationId;

  const setSelectedTab = (tab) => {
    window.location.href = `/pro-manager-list?tab=${tab}`;
  };

  return (
    <div className="pro-manager-panel">
      <div className="pro-manager-panel__container">
        <SideBarMenu
          menuTitle="Pro Manger"
          tabOptions={proManagerPanelTabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          userAccessLevel={1}
        />
        <div className="pro-manager-panel__content">
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
          {selectedTab === proManagerPanelTabs.accountProfiles.id && accountDetail && (
            <AccountDetailSection
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              organizationId={organizationId}
              organizationName={organizationName}
            />
          )}
          {selectedTab === proManagerPanelTabs.accountProfiles.id && !accountDetail && (
            <AccountsListSection isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
          {selectedTab === proManagerPanelTabs.userProfiles.id && userDetail && (
            <UserDetailSection
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              organizationId={organizationId}
              userId={userId}
            />
          )}
          {selectedTab === proManagerPanelTabs.userProfiles.id && !userDetail && (
            <UsersListSection isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

export default withRouter(ProManagerPanel);
