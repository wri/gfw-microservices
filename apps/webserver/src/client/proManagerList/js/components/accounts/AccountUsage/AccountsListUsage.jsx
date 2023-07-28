import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { getOneMonthAgoDate, getTodayDate } from './AccountUsage.utils';

function AccountsListUsage() {
  const todayDate = getTodayDate();
  const oneMonthAgoDate = getOneMonthAgoDate();
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({});
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(todayDate);

  useEffect(() => {
    fetch(`/analytics/usage?startDate=${startDate}&endDate=${endDate}&countForEachList=0`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsageData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [startDate, endDate]);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    // Check if the selected endDate is before the new startDate
    if (event.target.value > endDate) {
      setEndDate(event.target.value);
    }
  };

  const handleEndDateChange = (event) => {
    // Check if the selected endDate is before the startDate
    if (event.target.value < startDate) {
      setEndDate(startDate);
    } else {
      setEndDate(event.target.value);
    }
  };

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
        <input
          type="date"
          id="endDatePicker"
          value={endDate}
          onChange={handleEndDateChange}
          min={startDate}
        />
      </div>
      {isLoading && <CircularProgress color="success" />}
      {!isLoading && (
        <div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Organization Name</TableCell>
                  <TableCell align="right">Number of lists</TableCell>
                  <TableCell align="right"> Max area per list</TableCell>
                  <TableCell align="right">Total area analyzed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usageData.map((row) => (
                  <TableRow
                    key={row.organization_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.organization_id}
                    </TableCell>
                    <TableCell align="right">{row.number_of_lists_analyzed}</TableCell>
                    <TableCell align="right">{row.max_area_analyzed}</TableCell>
                    <TableCell align="right">{row.total_area_analyzed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </section>
  );
}

export default AccountsListUsage;
