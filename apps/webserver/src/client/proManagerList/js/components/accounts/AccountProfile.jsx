import React from 'react';
import GfwButton from '../../../../common/js/components/GfwButton';
import DialogProvider from '../../../../common/js/components/Dialog';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import SettingSection from '../../../../common/js/components/SettingSection';
import AccountProfileFormSetting from './AccountProfileFormSetting';
import AccountStatusSetting from './AccountStatusSetting';
import AccountDetailUsage from './AccountUsage/AccountDetailUsage.jsx';
import UserProfileManager from '../users/UserProfileManager';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import { accountProfileStrings } from '../../../../common/js/config';

export default function AccountProfile({
  users,
  accountData,
  classificationsData,
  statusData,
  accessData,
  policyList,
}) {
  const back = () => {
    window.location.href = '/pro-manager-list?tab=accounts';
  };

  const isAccountStatusActive =
    accountData.organization_status_id === ACCOUNT_ORG_STATUSES['ACTIVE'];

  return (
    <DialogProvider>
      <Grid container justifyContent="end" sx={{ marginBottom: '1.5rem' }}>
        <GfwButton classNames="btn-green" onClick={back} value="Back to Profile Manager" />
      </Grid>
      <SettingSection heading={accountProfileStrings.sectionTitles.profileForm}>
        <AccountProfileFormSetting
          accountData={accountData}
          classificationsData={classificationsData}
          policyList={policyList}
        />
      </SettingSection>
      <SettingSection heading={accountProfileStrings.sectionTitles.statusSetting}>
        <AccountStatusSetting
          organization_id={accountData.organization_id}
          organization_status_id={accountData.organization_status_id}
        />
      </SettingSection>
      {isAccountStatusActive && (
        <SettingSection heading={accountProfileStrings.sectionTitles.accountUsage}>
          <AccountDetailUsage organizationId={accountData.organization_id} />
        </SettingSection>
      )}

      <SettingSection heading={accountProfileStrings.sectionTitles.accountUsers}>
        <Box
          sx={{
            'h2.section-title-normal': {
              display: 'none',
            },
          }}
        >
          <UserProfileManager
            users={users.filter((user) => user.organization_id === accountData.organization_id)}
            statusData={statusData}
            accessData={accessData}
          />
        </Box>
      </SettingSection>
    </DialogProvider>
  );
}
