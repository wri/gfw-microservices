import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DateRangeSelector from './DateRangeSelector';
import { oneMonthAgoDate, todaysDate } from './AccountUsage.utils';
import { accountProfileStrings } from '../../../../../common/js/config';

function AccountDetailUsage({ organizationId }) {
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(todaysDate);
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({});

  const { number_of_lists_analyzed, max_area_analyzed, total_area_analyzed } = usageData;

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `/analytics/usage?startDate=${startDate}&endDate=${endDate}&countForEachList=0&organizationId=${organizationId}`,
      {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
      }
    )
      .then((res) => res.json())
      .then(([data]) => {
        setUsageData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [startDate, endDate]);

  return (
    <section>
      <DateRangeSelector
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      {isLoading && <CircularProgress color="success" />}
      {!isLoading && (
        <div>
          <div>
            {`${accountProfileStrings.accountUsageLabels.numberOfLists} ${number_of_lists_analyzed}`}
          </div>
          <div>
            {`${accountProfileStrings.accountUsageLabels.maxAreaPerList} ${max_area_analyzed}`}
          </div>
          <div>
            {`${accountProfileStrings.accountUsageLabels.totalAreaAnalyzed} ${total_area_analyzed}`}
          </div>
        </div>
      )}
    </section>
  );
}

export default AccountDetailUsage;
