import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import AccountProfile from './AccountProfile';

const AccountDetailContext = createContext();

export function useAccountDetail() {
  return useContext(AccountDetailContext);
}

export default function AccountDetailSection({
  isLoading,
  setIsLoading,
  organizationId,
  organizationName,
}) {
  const [promanagerData, setPromanagerData] = useState({});
  const {
    users,
    classes: classificationsData,
    statusData,
    accessData,
    policyList,
    selectedAccount: currentAccount,
  } = promanagerData;

  const fetchAccountData = useCallback(async () => {
    setIsLoading(true);
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

  useEffect(() => {
    fetchAccountData();
  }, []);

  return currentAccount && !isLoading ? (
    <AccountDetailContext.Provider
      value={{
        users,
        currentAccount,
        classificationsData,
        statusData,
        accessData,
        disable: currentAccount.organization_status_id !== ACCOUNT_ORG_STATUSES['PENDING'],
        policyList,
        refreshAccountData: fetchAccountData,
      }}
    >
      <AccountProfile />
    </AccountDetailContext.Provider>
  ) : null;
}
