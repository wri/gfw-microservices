import React, { useEffect, useState } from 'react';
import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';
import AccountUsage from './AccountUsage';
import moment from 'moment';

const startDate = moment().subtract(1, 'months').format('YYYY-MM-DD');
const endDate = moment().format('YYYY-MM-DD');

export default function AccountUsageContainer() {
  const [usageData, setUsageData] = useState(null);

  useEffect(() => {
    fetch(`/analytics/myorg/usage?startDate=${startDate}&endDate=${endDate}&countForEachList=0`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(([data]) => {
        setUsageData(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return usageData === null ? <InlineLoader /> : <AccountUsage {...usageData} />;
}
