// External
import { useEffect, useState } from 'react';

// Styles
import '../../../css/proManagerList.scss';

// Constants / Config
import { PRO_MANAGER_PATH } from '../../common/paths';
import {
  ACCOUNT_ORG_STATUSES,
  ORG_CLASSIFICATIONS,
} from '../../../../common/js/constants/orgAccountStatuses';
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
    if (!orgClasses) {
      return false;
    }

    const classes = orgClasses.split(',').map((c) => parseInt(c, 10));
    const filter = acctFilterStr.toLowerCase();

    return classes.some((c) => {
      const classText = ORG_CLASSIFICATIONS[c];
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
    const column = evt.currentTarget.title;
    const direction = accountSortingCategory === column && accountDir === 'asc' ? 'desc' : 'asc';

    setAccountSortingCategory(column);
    setAccountDir(direction);
  };

  // Default: data already sorted by requested_date DESC from server
  // UI sort will override if accountSortingCategory or accountDir changes
  const sortAccounts = (filteredAccts) => {
    if (!filteredAccts) {
      return [];
    }

    if (['classString', 'statusString'].includes(accountSortingCategory)) {
      const getValue = (acct) => {
        if (accountSortingCategory === 'classString') {
          return getClassificationString(acct);
        }
        if (accountSortingCategory === 'statusString') {
          return getStatusString(acct);
        }
        return '';
      };

      return filteredAccts.sort((a, b) => {
        const aVal = getValue(a);
        const bVal = getValue(b);

        // Defensive fallback for nullish values
        if (aVal == null && bVal == null) {
          return 0;
        }
        if (aVal == null) {
          return accountDir === 'asc' ? -1 : 1;
        }
        if (bVal == null) {
          return accountDir === 'asc' ? 1 : -1;
        }

        // Use localeCompare for string safety
        const compare = String(aVal).localeCompare(String(bVal));
        return accountDir === 'asc' ? compare : -compare;
      });
    }

    // For other categories, UI will sort only if accountSortingCategory changes
    return filteredAccts.sort((a, b) => {
      const aVal = a[accountSortingCategory] ?? '';
      const bVal = b[accountSortingCategory] ?? '';

      if (accountSortingCategory.includes('Date')) {
        const aTime = new Date(aVal).getTime() || 0;
        const bTime = new Date(bVal).getTime() || 0;
        return accountDir === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return accountDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return accountDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
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

    // enrich accounts with derived fields used for sorting
    const accountsWithDerivedFields = filteredAccounts.map((acct) => ({
      ...acct,
      requestedDateString: getDateString(
        acct,
        ACCOUNT_ORG_STATUSES.PENDING,
        'organization_requested_time'
      ),
      activeDateString: getDateString(
        acct,
        ACCOUNT_ORG_STATUSES.ACTIVE,
        'organization_activated_time'
      ),
    }));

    const sortedFilteredAccounts = sortAccounts(accountsWithDerivedFields);
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
