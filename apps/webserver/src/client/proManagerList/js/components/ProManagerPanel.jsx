import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import UsersListSection from './users/UsersListSection';
import UserDetailSection from './users/UserDetailSection';
import AccountsListSection from './accounts/AccountsListSection';
import AccountDetailSection from './accounts/AccountDetailSection';
import AccountsListUsage from './accounts/AccountUsage/AccountsListUsage';
import SideBarMenu from '../../../common/js/components/SideBarMenu';
import { proManagerPanelTabs } from './proManagerPanelTabs';
import AccountLimits from './accounts/AccountLimits';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Loading from '../../../common/js/components/Loaders/Loading';

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
    <Grid
      container
      className="pro-manager-panel"
      spacing={4}
      sx={{ padding: '1.5rem', backgroundColor: '#fff' }}
    >
      <Grid item xs={12} sm={3}>
        <SideBarMenu
          menuTitle="Pro Manager"
          tabOptions={proManagerPanelTabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          userAccessLevel={1}
        />
      </Grid>
      <Grid item xs={12} sm={9}>
        <Box>
          {isLoading && <Loading />}
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
          {selectedTab === proManagerPanelTabs.accounLimits.id && (
            <AccountLimits isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
          {selectedTab === proManagerPanelTabs.accountUsage.id && (
            <AccountsListUsage isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

export default withRouter(ProManagerPanel);
