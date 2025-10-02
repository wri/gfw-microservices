import { Box, Grid } from '@mui/material';

import DialogProvider from '../../../../common/js/components/Dialog';
import SettingSection from '../../../../common/js/components/SettingSection';
import AccountProfileFormSetting from './AccountProfileFormSetting';
import AccountStatusSetting from './AccountStatusSetting';
import AccountDetailUsage from './AccountUsage/AccountDetailUsage.jsx';
import UserProfileManager from '../users/UserProfileManager';
import { accountProfileStrings } from '../../../../common/js/config';
import AccountProfileLimitsSetting from './AccountProfileLimitsSetting';
import { useAccountDetail } from './AccountDetailSection';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import { PillButton } from '../../../../components';
import { PRO_MANAGER_PATH } from '../../common/paths';

export default function AccountProfile() {
  const { users, currentAccount, statusData, accessData } = useAccountDetail();

  const isAccountStatusActive =
    currentAccount.organization_status_id === ACCOUNT_ORG_STATUSES['ACTIVE'];

  return (
    <DialogProvider>
      <Grid container justifyContent="end" sx={{ marginBottom: '1.5rem' }}>
        <PillButton variant="contained" size="small" href={`${PRO_MANAGER_PATH}?tab=accounts`}>
          Return to Accounts List
        </PillButton>
      </Grid>
      <SettingSection heading={accountProfileStrings.sectionTitles.profileForm}>
        <AccountProfileFormSetting />
      </SettingSection>
      <SettingSection heading={accountProfileStrings.sectionTitles.statusSetting}>
        <AccountStatusSetting />
      </SettingSection>
      <SettingSection heading={accountProfileStrings.sectionTitles.limitsSetting}>
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
            users={users.filter((user) => user.organization_id === currentAccount.organization_id)}
            statusData={statusData}
            accessData={accessData}
          />
        </Box>
      </SettingSection>
    </DialogProvider>
  );
}
