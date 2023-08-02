import React from 'react';
import GfwButton from '../../../../common/js/components/GfwButton';
import DialogProvider from '../../../../common/js/components/Dialog';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import SettingSection from '../../../../common/js/components/SettingSection';
import AccountProfileFormSetting from './AccountProfileFormSetting';
import AccountStatusSetting from './AccountStatusSetting';
import UserProfileManager from '../users/UserProfileManager';
import { accountProfileStrings } from '../../../../common/js/config';
import AccountProfileLimitsSetting from './AccountProfileLimitsSetting';

export default function AccountProfile({
  users,
  currentAccount,
  classificationsData,
  statusData,
  accessData,
  disable: isAccountStatusNotPending /* Only pending accounts can modify certain information */,
  policyList,
}) {
  const back = () => {
    window.location.href = '/pro-manager-list?tab=accounts';
  };

  return (
    <DialogProvider>
      <Grid container justifyContent="end" sx={{ marginBottom: '1.5rem' }}>
        <GfwButton classNames="btn-green" onClick={back} value="Back to Profile Manager" />
      </Grid>
      <SettingSection heading={accountProfileStrings.sectionTitles.profileForm}>
        <AccountProfileFormSetting
          isAccountStatusNotPending={isAccountStatusNotPending}
          accountData={currentAccount}
          classificationsData={classificationsData}
          policyList={policyList}
        />
      </SettingSection>
      <SettingSection heading={accountProfileStrings.sectionTitles.statusSetting}>
        <AccountStatusSetting
          organization_id={currentAccount.organization_id}
          organization_status_id={currentAccount.organization_status_id}
        />
      </SettingSection>
      <SettingSection heading={accountProfileStrings.sectionTitles.limitsSetting}>
        <AccountProfileLimitsSetting
          accountLimitsData={{
            account_limits_per_list: 1,
            account_limits_per_year: 1
          }}
          isAccountStatusNotPending={isAccountStatusNotPending}
          organizationType={currentAccount.subscription_status_id}
          organizationId={currentAccount.organization_id}
          organization_status_id={currentAccount.organization_status_id}
        />
      </SettingSection>
      <SettingSection heading={accountProfileStrings.sectionTitles.accountUsers}>
        <Box
          sx={{
            'h2.section-title-normal': {
              display: 'none',
            },
          }}
        >
          <UserProfileManager
            users={users.filter((user) => user.organization_id === currentAccount.organization_id)}
            statusData={statusData}
            accessData={accessData}
          />
        </Box>
      </SettingSection>
    </DialogProvider>
  );
}
