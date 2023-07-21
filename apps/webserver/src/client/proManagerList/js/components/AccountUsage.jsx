import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

function AccountUsage({ organizationId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  useEffect(() => {
    fetch(
      `/analytics/usage?startDate=2023-07-01&endDate=2023-07-30&countForEachList=0&organizationId=${organizationId}`,
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
        setUsageData(data);
        console.log(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const { number_of_lists_analyzed, max_area_analyzed, total_area_analyzed } = usageData;
  console.log({ startDate, endDate });
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

export default AccountUsage;
