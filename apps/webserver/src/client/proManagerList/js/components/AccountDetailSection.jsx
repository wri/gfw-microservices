import React, { useState, useEffect } from 'react';
import AccountProfile from './AccountProfile';
import AccountProfile_DEPRECATED from './AccountProfile_DEPRECATED';

// deleteme after test and code review
function getCookie(name) {
  let cookie = {};
  document.cookie.split(';').forEach(function (el) {
    let [k, v] = el.split('=');
    cookie[k.trim()] = v;
  });
  return cookie[name];
}

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
        <>
          {getCookie('version') == 1 ? (
            <AccountProfile_DEPRECATED
              users={users}
              currentAccount={selectedAccount}
              classificationsData={classes}
              statusData={statusData}
              accessData={accessData}
              disable={selectedAccount.organization_status_id !== 1}
              policyList={policyList}
            />
          ) : (
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
      )}
    </>
  );
}

export default AccountDetailSection;
