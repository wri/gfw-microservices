import React from 'react';
import { useProfileContext } from '../../ProfileStateContext';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AccountProfile from './AccountProfile';

export default function AccountProfileContainer() {
  /**
   * @summary
   * users = organizationUsers
   * organization (empty object for non-admin) = currentAccount
   * userInfo = currentUser
   */
  const { users, userInfo, organization, classifications, policyList } = useProfileContext();

  /**
   * @todo we should refactor account profile in favor of material UI into its own task.
   * @tag techdebt
   */
  return (
    <Card className="profile-page" sx={{ padding: 0 }}>
      <CardContent>
        <AccountProfile
          users={users}
          currentAccount={organization || {}}
          classificationsData={classifications}
          currentUser={userInfo}
          policyList={policyList}
        />
      </CardContent>
    </Card>
  );
}
