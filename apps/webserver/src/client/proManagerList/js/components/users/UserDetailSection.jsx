import { useState, useEffect } from 'react';
import ManagedUserProfile from './ManagedUserProfile';
import errorLogger from '../../../../common/js/utils/errorLogger';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';

function UserDetailSection({ isLoading, setIsLoading, organizationId, userId }) {
  const [promanagerData, setPromanagerData] = useState({});

  useEffect(() => {
    fetch(`/pro-manager-list/users/${organizationId}/${userId}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPromanagerData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        errorLogger.error('Error fetching user detail data', {
          component: 'UserDetailSection',
          action: 'fetchUserData',
          error,
          organizationId,
          userId,
        });
        setIsLoading(false);
      });
  }, []);

  const { classes, commoditiesData, geographiesData, titlesData, selectedUser } = promanagerData;

  console.log(
    '[UserDetailSection] selectedUser.org_status:',
    selectedUser?.org_status,
    '| isReadOnly:',
    selectedUser ? selectedUser.org_status == ACCOUNT_ORG_STATUSES.INACTIVE : 'no selectedUser yet'
  );

  return (
    <>
      {selectedUser && !isLoading && (
        <ManagedUserProfile
          userOnly
          classificationsData={classes}
          commoditiesData={commoditiesData}
          geographiesData={geographiesData}
          titlesData={titlesData}
          currentUser={selectedUser}
          // isReadOnly: disables all fields when the organization is inactive (org_status == 3)
          isReadOnly={selectedUser.org_status == ACCOUNT_ORG_STATUSES.INACTIVE}
        />
      )}
    </>
  );
}

export default UserDetailSection;
