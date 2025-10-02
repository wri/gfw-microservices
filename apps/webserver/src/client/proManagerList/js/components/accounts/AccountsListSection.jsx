// External
import { useEffect, useState } from 'react';

// Styles
import '../../../css/proManagerList.scss';

// Constants / Config
import { PRO_MANAGER_PATH } from '../../common/paths';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import AccountsListsTable from './AccountsListsTable';

// Components
import { AccountStatusChip, getStatusString } from './AccountStatusChip';

function AccountsListSection({ isLoading, setIsLoading }) {
  const [promanagerData, setPromanagerData] = useState({});
  const [acctFilterStr, setAcctFilterStr] = useState('');
  const [accountSortingCategory, setAccountSortingCategory] = useState('');
  const [accountDir, setAccountDir] = useState('desc');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('/pro-manager-list/accounts', {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`HTTP error - status: ${res.status}`);
        }

        const data = await res.json();
        setPromanagerData(data);
      } catch (error) {
        console.error('❌ Failed to fetch accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const { accounts, classes } = promanagerData;

  const getDateString = (account, expectedStatus, timeField) => {
    if (account.organization_status_id === expectedStatus && account[timeField]) {
      const date = new Date(account[timeField]);
      return date.toUTCString().replace(',', '');
    }
    return null;
  };

  const getClassificationString = (account) => {
    const ids = account.organization_classifications_ids || [];

    return classes
      .filter((classType) => ids.includes(classType.id))
      .map((classType, i, arr) => (
        <div key={`${account.organization_id}-${classType.id}`}>
          {classType.classification_name}
          {i < arr.length - 1 && ','}
        </div>
      ));
  };

  const createAccountRow = (account) => {
    const requestedDateString = getDateString(
      account,
      ACCOUNT_ORG_STATUSES.PENDING,
      'organization_requested_time'
    );
    const activeDateString = getDateString(
      account,
      ACCOUNT_ORG_STATUSES.ACTIVE,
      'organization_activated_time'
    );
    const classificationString = getClassificationString(account);

    const website = account.organization_website
      ? account.organization_website.startsWith('http')
        ? account.organization_website
        : `https://${account.organization_website}`
      : '—';

    return (
      <tr key={account.organization_id}>
        <td
          className="pro-manager-table-link"
          onClick={() =>
            (window.location.href = `${PRO_MANAGER_PATH}?tab=accounts&organizationId=${account.organization_id}&organizationName=${account.organization_name}`)
          }
        >
          {account.organization_name}
        </td>
        <td>{account.organization_parent || '—'}</td>
        <td>{classificationString}</td>
        <td>
          <AccountStatusChip account={account} />
        </td>
        <td>{requestedDateString || 'N/A'}</td>
        <td>{activeDateString || 'N/A'}</td>
        <td>{account.organization_address || '—'}</td>
        <td>
          {website !== '—' ? (
            <a href={website} target="_blank" rel="noreferrer">
              {website}
            </a>
          ) : (
            '—'
          )}
        </td>
      </tr>
    );
  };

  const searchAccts = (evt) => {
    setAcctFilterStr(evt.target.value);
  };

  const determineOrgClass = (orgClasses) => {
    const classMap = {
      1: 'Commercial Bank',
      2: 'Consumer Goods Manufacturer',
      3: 'Development Finance Institution',
      4: 'Governmental Organization',
      5: 'Investment Fund',
      6: 'NGO',
      7: 'Producer',
      8: 'Retailer',
      9: 'Processor/Trader',
      10: 'Service Provider',
    };

    if (!orgClasses) {
      return false;
    }

    const classes = orgClasses.split(',').map((c) => parseInt(c, 10));
    const filter = acctFilterStr.toLowerCase();

    return classes.some((c) => {
      const classText = classMap[c];
      return classText?.toLowerCase().includes(filter);
    });
  };

  const determineOrgStatusLabel = (statusId, account) => {
    const statusMap = {
      [ACCOUNT_ORG_STATUSES.PENDING]: 'Pending',
      [ACCOUNT_ORG_STATUSES.ACTIVE]: 'Active',
      [ACCOUNT_ORG_STATUSES.INACTIVE]: 'Inactive',
    };

    const isPendingButClosed =
      statusId === ACCOUNT_ORG_STATUSES.PENDING && account?.organization_active === false;

    let status = isPendingButClosed ? 'Closed' : statusMap[statusId] || 'Unknown';

    return status.toLowerCase().includes(acctFilterStr.toLowerCase());
  };

  const sortAcctTable = (evt) => {
    const direction = accountDir === 'desc' ? 'asc' : 'desc';
    setAccountDir(direction);
    setAccountSortingCategory(evt.target.title);
  };

  // Default: data already sorted by requested_date DESC from server
  // UI sort will override if accountSortingCategory or accountDir changes
  const sortAccounts = (filteredAccts) => {
    if (!filteredAccts) {
      return [];
    }

    if (accountSortingCategory === 'classString' || accountSortingCategory === 'statusString') {
      return filteredAccts.sort((a, b) => {
        const aValue = { ...a };
        const bValue = { ...b };

        if (accountSortingCategory === 'classString') {
          aValue.classString = getClassificationString(aValue);
          bValue.classString = getClassificationString(bValue);
        } else {
          aValue.statusString = getStatusString(aValue);
          bValue.statusString = getStatusString(bValue);
        }

        if (accountDir === 'asc') {
          return aValue[accountSortingCategory] < bValue[accountSortingCategory] ? -1 : 1;
        } else {
          return aValue[accountSortingCategory] < bValue[accountSortingCategory] ? 1 : -1;
        }
      });
    }

    // For other categories, UI will sort only if accountSortingCategory changes
    return filteredAccts;
  };

  const getAccountsList = () => {
    const filteredAccounts = (accounts || []).filter((acct) => {
      return (
        acct.organization_name?.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        acct.organization_parent?.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        acct.organization_address?.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        acct.organization_website?.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        determineOrgClass(acct.organization_classifications_ids) ||
        determineOrgStatusLabel(acct.organization_status_id)
      );
    });

    const sortedFilteredAccounts = sortAccounts(filteredAccounts);
    return sortedFilteredAccounts.map(createAccountRow);
  };

  return (
    <>
      {!isLoading && (
        <AccountsListsTable
          accountSortingCategory={accountSortingCategory}
          accountDir={accountDir}
          accountsList={getAccountsList()}
          searchAccts={searchAccts}
          sortAcctTable={sortAcctTable}
        />
      )}
    </>
  );
}

export default AccountsListSection;
