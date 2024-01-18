import React from 'react';
import {
  getOneDayAfterStartDate,
  getOneDayBeforeEndDate,
  todaysDateISOString,
} from './AccountUsage.utils';
import Grid from '@mui/material/Grid';
import { accountProfileStrings } from '../../../../../common/js/config';

function DateRangeSelector({ startDate, setStartDate, endDate, setEndDate }) {
  const oneDayAfterStartDateISOString = getOneDayAfterStartDate(startDate);
  const oneDayBeforeEndDateISOString = getOneDayBeforeEndDate(endDate);

  // Function to handle start date change
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  // Function to handle end date change
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <label htmlFor="startDatePicker">
          {accountProfileStrings.dateRangeSelector.selectStartDate}
        </label>
        <input
          type="date"
          id="startDatePicker"
          value={startDate}
          onChange={handleStartDateChange}
          max={oneDayBeforeEndDateISOString}
        />
      </Grid>
      <Grid item xs={6}>
        <label htmlFor="endDatePicker">
          {accountProfileStrings.dateRangeSelector.selectEndDate}
        </label>
        <input
          type="date"
          id="endDatePicker"
          value={endDate}
          onChange={handleEndDateChange}
          min={oneDayAfterStartDateISOString}
          max={todaysDateISOString} // Set the maximum selectable date to be today
        />
      </Grid>
    </Grid>
  );
}

export default DateRangeSelector;
