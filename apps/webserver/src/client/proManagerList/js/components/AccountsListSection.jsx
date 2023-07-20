import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import AccountProfile from './AccountProfile';
import AccountsListsTable from './AccountsListsTable';
import '../../css/proManagerList.scss';

function AccountsListSection({ isLoading, setIsLoading }) {
  const [promanagerData, setPromanagerData] = useState({});
  const [acctFilterStr, setAcctFilterStr] = useState('');
  const [accountSortingCategory, setAccountSortingCategory] = useState('organization_name');
  const [accountDir, setAccountDir] = useState('des');

  useEffect(() => {
    fetch(`/pro-manager-list/accounts`, {
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

  const { accounts, classes, statusData } = promanagerData;

  const findPendingDateString = (account) => {
    let dateString = null;
    if (account.organization_status_id === 1 && account.organization_activated_time) {
      const date = new Date(account.organization_activated_time);
      dateString = `${date.toUTCString().replace(',', '')}`;
    }
    return dateString;
  };

  const findActiveDateString = (account) => {
    let dateString = null;
    if (account.organization_status_id === 2 && account.organization_activated_time) {
      const date = new Date(account.organization_activated_time);
      dateString = `${date.toUTCString().replace(',', '')}`;
    }
    return dateString;
  };

  const findStatusString = (account) => {
    const statusString = statusData.find(
      (status) => status.id === account.organization_status_id
    ).status_name;
    return statusString;
  };

  const findClassString = (account) => {
    const classString = [];
    classes.forEach((classType) => {
      if (account.organization_classifications_ids?.indexOf(classType.id) > -1) {
        classString.push(classType.classification_name);
      }
    });
    const classArray = [];
    classString.forEach((string, i) => {
      if (i === classString.length - 1) {
        classArray.push(<div key={`${account.organization_id}-${string}`}>{string}</div>);
      } else {
        classArray.push(<div key={`${account.organization_id}-${string}`}>{string},</div>);
      }
    });
    return classArray;
  };

  const createAccountsList = (account) => {
    const accountRows = [];
    const pendingDateString = findPendingDateString(account);
    const activeDateString = findActiveDateString(account);
    const statusString = findStatusString(account);
    const classString = findClassString(account);
    if (account.organization_website.indexOf('http') === -1) {
      // eslint-disable-next-line no-param-reassign
      account.organization_website = `https://${account.organization_website}`;
    }
    accountRows.push(
      <tr key={account.organization_id}>
        <td
          className="pro-manager-table-link"
          onClick={() => {
            window.location.href = `/pro-manager-list?tab=accounts&organizationId=${account.organization_id}&organizationName=${account.organization_name}`;
          }}
        >
          {account.organization_name}
        </td>
        <td>{account.organization_parent}</td>
        <td>{account.organization_address}</td>
        <td>
          <a href={account.organization_website} target="_blank" rel="noreferrer">
            {account.organization_website}
          </a>
        </td>
        <td>{classString}</td>
        <td>{statusString}</td>
        <td>{pendingDateString}</td>
        <td>{activeDateString}</td>
      </tr>
    );
    return accountRows;
  };

  const searchAccts = (evt) => {
    setAcctFilterStr(evt.target.value);
  };

  const determineOrgClass = (orgClasses) => {
    if (orgClasses) {
      let valid = false;
      const classes = orgClasses.split(',');
      classes.forEach((orgClass) => {
        let classText;
        switch (parseInt(orgClass, 10)) {
          case 1:
            classText = 'Commercial Bank';
            break;
          case 2:
            classText = 'Consumer Goods Manufacturer';
            break;
          case 3:
            classText = 'Development Finance Institution';
            break;
          case 4:
            classText = 'Governmental Organization';
            break;
          case 5:
            classText = 'Investment Fund';
            break;
          case 6:
            classText = 'NGO';
            break;
          case 7:
            classText = 'Producer';
            break;
          case 8:
            classText = 'Retailer';
            break;
          case 9:
            classText = 'Processor/Trader';
            break;
          case 10:
            classText = 'Service Provider';
            break;
          default:
            break;
        }

        if (classText.toLowerCase().includes(acctFilterStr.toLowerCase())) {
          valid = true;
        }
      });
      return valid;
    }
    return false;
  };

  const determineOrgStatus = (statusId) => {
    let status;
    switch (statusId) {
      case 1:
        status = 'Pending';
        break;
      case 2:
        status = 'Active';
        break;
      case 3:
        status = 'Inactive';
        break;
      default:
        break;
    }
    return status.toLowerCase().includes(acctFilterStr.toLowerCase());
  };

  const sortAcctTable = (evt) => {
    const direction = accountDir === 'des' ? 'asc' : 'des';
    setAccountDir(direction);
    setAccountSortingCategory(evt.target.title);
  };

  const sortAccounts = (filteredAccts) => {
    const sortedAccounts =
      accountSortingCategory === 'pendingDateString' ||
      accountSortingCategory === 'activeDateString'
        ? _.orderBy(
            filteredAccts,
            (acct) => new Date(acct.organization_activated_time),
            accountDir === 'asc' ? 'asc' : 'desc'
          )
        : filteredAccts.sort((a, b) => {
            const aValue = a;
            const bValue = b;
            if (accountSortingCategory === 'classString') {
              aValue.classString = findClassString(aValue);
              bValue.classString = findClassString(bValue);
            } else if (accountSortingCategory === 'statusString') {
              aValue.classString = findStatusString(aValue);
              bValue.classString = findStatusString(bValue);
            }
            if (accountDir === 'asc') {
              if (aValue[accountSortingCategory] < bValue[accountSortingCategory]) {
                return -1;
              }
              if (aValue[accountSortingCategory] > bValue[accountSortingCategory]) {
                return 1;
              }
              return 0;
            }
            if (aValue[accountSortingCategory] < bValue[accountSortingCategory]) {
              return 1;
            }
            if (aValue[accountSortingCategory] > bValue[accountSortingCategory]) {
              return -1;
            }
            return 0;
          });
    return sortedAccounts;
  };

  const getAccountsList = () => {
    const filteredAccts = accounts.filter((e) => {
      return (
        e.organization_name.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        e.organization_parent.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        e.organization_address.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        e.organization_website.toLowerCase().includes(acctFilterStr.toLowerCase()) ||
        determineOrgClass(e.organization_classifications_ids) ||
        determineOrgStatus(e.organization_status_id) ||
        e.organization_name.toLowerCase().includes(acctFilterStr.toLowerCase())
      );
    });
    const sortedFilteredAccounts = sortAccounts(filteredAccts);

    const accountsList = sortedFilteredAccounts.map(createAccountsList);
    return accountsList;
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
