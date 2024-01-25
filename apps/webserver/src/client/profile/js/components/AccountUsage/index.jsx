import React, { useEffect, useState } from 'react';
import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';
import AccountUsage from './AccountUsage';
import moment from 'moment';
import { useProfileContext } from '../../ProfileStateContext';

export default function AccountUsageContainer() {
  const { accountActivatedTime } = useProfileContext();
  const [usageData, setUsageData] = useState(null);
  const todayAsEndDay = moment();
  const accountActivationDate = moment(accountActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay
    .clone()
    .subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');

  useEffect(() => {
    fetch(
      `/analytics/myorg/usage?startDate=${accountLatestYearStartDate.format(
        'YYYY-MM-DD'
      )}&endDate=${todayAsEndDay.format('YYYY-MM-DD')}`,
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const [usageData] = data;
        setUsageData(usageData);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return usageData === null ? (
    <InlineLoader />
  ) : (
    <AccountUsage
      {...usageData}
      subscriptionYearStart={accountLatestYearStartDate.format('LL')}
      subscriptionYearEnd={accountLatestYearStartDate.clone().add(1, 'years').format('LL')}
    />
  );
}
