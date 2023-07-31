import React from 'react';
import { todayString } from './AccountUsage.utils';
import { accountProfileStrings } from '../../../../../common/js/config';

function DateRangeSelector({ startDate, setStartDate, endDate, setEndDate }) {
  const oneDayBeforeEndDate = new Date(endDate);
  // maximum start date is one day before the end date
  oneDayBeforeEndDate.setDate(oneDayBeforeEndDate.getDate() - 1);
  const oneDayBeforeEndDateString = oneDayBeforeEndDate.toISOString().slice(0, 10);

  // mimimum end date is one day after the start date
  const oneDayAfterStartDate = new Date(startDate);
  oneDayAfterStartDate.setDate(oneDayAfterStartDate.getDate() + 1);
  const oneDayAfterStartDateString = oneDayAfterStartDate.toISOString().slice(0, 10);

  // Function to handle start date change
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setEndDate(event.target.value);
  };

  // Function to handle end date change
  const handleEndDateChange = (event) => {
    const selectedEndDate = event.target.value;
    setEndDate(selectedEndDate);
  };

  return (
    <>
      <div>
        <label htmlFor="startDatePicker">
          {accountProfileStrings.dateRangeSelector.selectStartDate}
        </label>
        <input
          type="date"
          id="startDatePicker"
          value={startDate}
          onChange={handleStartDateChange}
          max={oneDayBeforeEndDateString}
        />
      </div>
      <div>
        <label htmlFor="endDatePicker">
          {accountProfileStrings.dateRangeSelector.selectEndDate}
        </label>
        <input
          type="date"
          id="endDatePicker"
          value={endDate}
          onChange={handleEndDateChange}
          min={oneDayAfterStartDateString}
          max={todayString} // Set the maximum selectable date to be today
        />
      </div>
    </>
  );
}

export default DateRangeSelector;
