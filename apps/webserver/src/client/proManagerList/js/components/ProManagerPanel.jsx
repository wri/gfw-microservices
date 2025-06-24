import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Box, Grid } from '@mui/material';

import AccountDetailSection from './accounts/AccountDetailSection';
import AccountLimits from './accounts/AccountLimits';
import AccountsListSection from './accounts/AccountsListSection';
import AccountsListUsage from './accounts/AccountUsage/AccountsListUsage';
import Converters from './converters/ConvertersPage';
import FeatureFlags from './featuresFlags/index';
import UsersListSection from './users/UsersListSection';
import UserDetailSection from './users/UserDetailSection';

import SideBarMenu from '../../../common/js/components/SideBarMenu';
import LatestCommits from './LatestCommits';
import { proManagerPanelTabs } from './proManagerPanelTabs';
import { LoadingModal } from '../../../components';

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
          {selectedTab === proManagerPanelTabs.accountLimits.id && (
            <AccountLimits isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
          {selectedTab === proManagerPanelTabs.accountUsage.id && (
            <AccountsListUsage isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
          {selectedTab === proManagerPanelTabs.latestCommits.id && (
            <LatestCommits isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
          {selectedTab === proManagerPanelTabs.featureFlags.id && (
            <FeatureFlags isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
          {selectedTab === proManagerPanelTabs.converters.id && (
            <Converters isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
        </Box>
        <LoadingModal isLoading={isLoading} />
      </Grid>
    </Grid>
  );
}

export default withRouter(ProManagerPanel);
