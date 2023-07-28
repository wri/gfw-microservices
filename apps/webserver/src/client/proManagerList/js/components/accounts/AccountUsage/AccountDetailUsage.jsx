import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { getOneMonthAgoDate, getTodayDate } from './AccountUsage.utils';

function AccountDetailUsage({ organizationId }) {
  const todayDate = getTodayDate();
  const oneMonthAgoDate = getOneMonthAgoDate();
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({});
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(todayDate);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  useEffect(() => {
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
      <div>
        <h2>Account usage</h2>
      </div>
      <div>
        <label htmlFor="startDatePicker">Select start date:</label>
        <input
          type="date"
          id="startDatePicker"
          value={startDate}
          onChange={handleStartDateChange}
        />
      </div>
      <div>
        <label htmlFor="endDatePicker">Select end date:</label>
        <input type="date" id="endDatePicker" value={endDate} onChange={handleEndDateChange} />
      </div>
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
