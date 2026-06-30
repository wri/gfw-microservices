import { useEffect, useState } from 'react';
import { Grid, Container, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import SideBarMenu from '../../common/js/components/SideBarMenu';
import { useProfileContext } from './ProfileStateContext';
import AccountProfileContainer from './components/AccountProfile';
import UserProfileManagerContainer from './components/UserProfileManager';
import AccountUsageContainer from './components/AccountUsage';
import ApiKeys from './components/ApiKeys';
import ApiDocs from './components/ApiDocs';
import profileTabs from './profileTabs';
import { PillButton } from '../../components';

export default function Profile() {
  const { userInfo, users, organization } = useProfileContext();

  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get('tab');
    const tabIds = Object.values(profileTabs).map((tab) => tab.id);
    return tabIds.includes(requestedTab) ? requestedTab : profileTabs.myOrganization.id;
  };

  const [selectedTab, setSelectedTab] = useState(getInitialTab);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  /**
   * Figure out why if there are not users redirect to this page
   */
  if (!users?.length) {
    window.location.href = `/user-profile?user_id=${userInfo.id}`;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flash = params.get('flash');

    if (flash === 'user-created') {
      setDialogTitle('User created');
      setDialogMessage('The user has been successfully created and activated.');
      setDialogOpen(true);
    } else if (flash === 'user-activated') {
      setDialogTitle('User activated');
      setDialogMessage('The user has been successfully activated.');
      setDialogOpen(true);
    }

    if (params.get('tab') || flash) {
      params.delete('tab');
      params.delete('flash');
      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  return (
    <Container sx={{ paddingTop: '2rem', maxWidth: '1024px' }}>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>{dialogMessage}</DialogContent>
        <DialogActions>
          <PillButton
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setDialogOpen(false)}
            autoFocus
          >
            OK
          </PillButton>
        </DialogActions>
      </Dialog>

      <Grid container spacing={4}>
        <Grid
          item
          xs={12}
          sm={3}
          sx={{
            marginBottom: {
              xs: '1.5rem',
            },
          }}
        >
          <SideBarMenu
            menuTitle="Profile"
            tabOptions={profileTabs}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            userAccessLevel={userInfo.access_level_id}
            accountSubscriptionStatus={organization?.subscription_status_id}
          />
        </Grid>
        <Grid item xs={12} sm={9}>
          {selectedTab === profileTabs.myOrganization.id && <AccountProfileContainer />}
          {selectedTab === profileTabs.userManagement.id && <UserProfileManagerContainer />}
          {selectedTab === profileTabs.accountUsage.id && <AccountUsageContainer />}
          {selectedTab === profileTabs.apiKeys?.id && <ApiKeys />}
          {selectedTab === profileTabs.apiDocs?.id && <ApiDocs />}
        </Grid>
      </Grid>
    </Container>
  );
}
