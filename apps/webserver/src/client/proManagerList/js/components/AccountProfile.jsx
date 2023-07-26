import React from 'react';
import GfwButton from '../../../common/js/components/GfwButton';
import DialogProvider from './Dialog';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import SettingSection from './SettingSection';
import { AccountProfileForm, AccountStatusSetting } from './AccountProfileForms';
import UserProfileManager from './UserProfileManager';

export default function AccountProfile({
  users,
  currentAccount,
  classificationsData,
  statusData,
  accessData,
  disable: isNotPending /* organization_status_id !== 1 */,
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
      <SettingSection heading="Account Profile">
        <AccountProfileForm
          isNotPending={isNotPending}
          accountData={currentAccount}
          classificationsData={classificationsData}
          policyList={policyList}
        />
      </SettingSection>
      <SettingSection heading="Account Status">
        <AccountStatusSetting
          organization_id={currentAccount.organization_id}
          organization_status_id={currentAccount.organization_status_id}
        />
      </SettingSection>
      <SettingSection heading="Users">
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
