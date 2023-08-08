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
import { accountProfileStrings, subscriptionStatusOptions } from '../../../../common/js/config';
import AccountProfileLimitsSetting from './AccountProfileLimitsSetting';
import { useAccountDetail } from './AccountDetailSection';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';

export default function AccountProfile() {
  const { users, currentAccount, statusData, accessData } = useAccountDetail();

  const back = () => {
    window.location.href = '/pro-manager-list?tab=accounts';
  };
  const getAccountLimitsTypeLabel = (isOrgPresent, orgSubscriptionStatus) => {
    if (isOrgPresent) {
      return accountProfileStrings.accountLimitsSetting.subHeadingCustomLimits;
    }
    return (
      subscriptionStatusOptions.find((subscription) => subscription.value === orgSubscriptionStatus)
        .label + accountProfileStrings.accountLimitsSetting.subHeadingSubscriptionLimits
    );
  };

  const isAccountStatusActive =
    accountData.organization_status_id === ACCOUNT_ORG_STATUSES['ACTIVE'];

  return (
    <DialogProvider>
      <Grid container justifyContent="end" sx={{ marginBottom: '1.5rem' }}>
        <GfwButton classNames="btn-green" onClick={back} value="Back to Profile Manager" />
      </Grid>
      <SettingSection heading={accountProfileStrings.sectionTitles.profileForm}>
        <AccountProfileFormSetting />
      </SettingSection>
      <SettingSection heading={accountProfileStrings.sectionTitles.statusSetting}>
        <AccountStatusSetting />
      </SettingSection>
      <SettingSection
        heading={accountProfileStrings.sectionTitles.limitsSetting}
        {...(currentAccount.analysis_limits !== null
          ? {
              subHeading: getAccountLimitsTypeLabel(
                currentAccount.analysis_limits.OrgID,
                currentAccount.analysis_limits.OrgType
              ),
            }
          : {})}
      >
        <AccountProfileLimitsSetting />
      </SettingSection>
      {isAccountStatusActive && (
        <SettingSection heading={accountProfileStrings.sectionTitles.accountUsage}>
          <AccountDetailUsage />
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
