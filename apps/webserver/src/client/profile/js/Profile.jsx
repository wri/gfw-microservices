import React, { useState } from 'react';
import SideBarMenu from '../../common/js/components/SideBarMenu';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { useProfileContext } from './ProfileStateContext';
import { userAccessLevel } from '../../common/js/config';
import AccountProfileContainer from './components/AccountProfile';
import UserProfileManagerContainer from './components/UserProfileManager';
import AccountUsageContainer from './components/AccountUsage';

const { ADMIN, EDITOR, VIEWER } = userAccessLevel;

const profileTabs = {
  myOrganization: {
    id: 'MY_ORGANIZATION',
    icon: 'corporate_fare',
    title: 'My Organization',
    userAccessLevel: [ADMIN, EDITOR, VIEWER],
  },
  userManagement: {
    id: 'USER_MANAGEMENT',
    icon: 'people',
    title: 'User Management',
    userAccessLevel: [ADMIN],
  },
  accountUsage: {
    id: 'account-usage',
    icon: 'running_with_errors',
    title: 'Usage',
    userAccessLevel: [ADMIN],
  },
};

export default function Profile() {
  const { userInfo, users } = useProfileContext();
  const [selectedTab, setSelectedTab] = useState(profileTabs.myOrganization.id);

  /**
   * Figure out why if there are not users redirect to this page
   */
  if (!users?.length) {
    window.location.href = `/user-profile?user_id=${userInfo.id}`;
  }

  return (
    <Container sx={{ paddingTop: '2rem', maxWidth: '1024px' }}>
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
          />
        </Grid>
        <Grid item xs={12} sm={9}>
          {selectedTab === profileTabs.myOrganization.id && <AccountProfileContainer />}
          {selectedTab === profileTabs.userManagement.id && <UserProfileManagerContainer />}
          {selectedTab === profileTabs.accountUsage.id && <AccountUsageContainer />}
        </Grid>
      </Grid>
    </Container>
  );
}
