import React, { useState, useEffect } from 'react';
import AccountProfile from './AccountProfile';

function AccountDetailSection({ isLoading, setIsLoading, organizationId, organizationName }) {
  const [promanagerData, setPromanagerData] = useState({});

  useEffect(() => {
    fetch(`/pro-manager-list/accounts/${organizationId}/${organizationName}`, {
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
        console.log(error);
      });
  }, []);

  const { users, classes, statusData, accessData, policyList, selectedAccount } = promanagerData;

  return (
    <>
      {selectedAccount && !isLoading && (
        <AccountProfile
          users={users}
          currentAccount={selectedAccount}
          classificationsData={classes}
          statusData={statusData}
          accessData={accessData}
          disable={selectedAccount.organization_status_id !== 1}
          policyList={policyList}
        />
      )}
    </>
  );
}

export default AccountDetailSection;
