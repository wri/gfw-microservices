import { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
import { PRO_MANAGER_PATH } from '../common/paths';

function useProManagerParams() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const defaultTab = proManagerPanelTabs.accountProfiles.id;
  const tabFromUrl = params.get('tab');
  const selectedTab = tabFromUrl || defaultTab;

  const converterJobId =
    selectedTab === proManagerPanelTabs.converters.id ? params.get('id') : null;

  return {
    organizationId: parseInt(params.get('organizationId') || '', 10),
    userId: parseInt(params.get('userId') || '', 10),
    organizationName: params.get('organizationName'),
    selectedTab,
    converterJobId,
  };
}

export default function ProManagerPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const { selectedTab, organizationId, userId, organizationName } = useProManagerParams();

  const userDetail = userId && organizationId;
  const accountDetail = organizationName && organizationId;

  const sharedProps = { isLoading, setIsLoading };

  const setSelectedTab = (tabId) => {
    window.location.href = `${PRO_MANAGER_PATH}?tab=${tabId}`;
  };

  function renderPanel() {
    switch (selectedTab) {
      case proManagerPanelTabs.converters.id:
        return <Converters {...sharedProps} />;
      case proManagerPanelTabs.accountProfiles.id:
        return accountDetail ? (
          <AccountDetailSection
            {...sharedProps}
            organizationId={organizationId}
            organizationName={organizationName}
          />
        ) : (
          <AccountsListSection {...sharedProps} />
        );
      case proManagerPanelTabs.userProfiles.id:
        return userDetail ? (
          <UserDetailSection {...sharedProps} organizationId={organizationId} userId={userId} />
        ) : (
          <UsersListSection {...sharedProps} />
        );
      case proManagerPanelTabs.accountLimits.id:
        return <AccountLimits {...sharedProps} />;
      case proManagerPanelTabs.accountUsage.id:
        return <AccountsListUsage {...sharedProps} />;
      case proManagerPanelTabs.latestCommits.id:
        return <LatestCommits {...sharedProps} />;
      case proManagerPanelTabs.featureFlags.id:
        return <FeatureFlags {...sharedProps} />;
      default:
        return null;
    }
  }

  return (
    <Grid container className="pro-manager-panel" spacing={4} sx={{ padding: '1.5rem' }}>
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
        <Box>{renderPanel()}</Box>
        <LoadingModal isLoading={isLoading} />
      </Grid>
    </Grid>
  );
}
