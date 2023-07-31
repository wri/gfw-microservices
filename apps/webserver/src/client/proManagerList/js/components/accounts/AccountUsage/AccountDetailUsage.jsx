import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DateRangeSelector from './DateRangeSelector';
import { getOneMonthAgoDate, getTodayDate } from './AccountUsage.utils';

function AccountDetailUsage({ organizationId }) {
  const todayDate = getTodayDate();
  const oneMonthAgoDate = getOneMonthAgoDate();
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({});

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

  const { number_of_lists_analyzed, max_area_analyzed, total_area_analyzed } = usageData;

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
          <div>{`Number of lists: ${number_of_lists_analyzed}`}</div>
          <div>{`Max area of list: ${max_area_analyzed}`}</div>
          <div>{`Total area Analyzed: ${total_area_analyzed}`} </div>
        </div>
      )}
    </section>
  );
}

export default AccountDetailUsage;
