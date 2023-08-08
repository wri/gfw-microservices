import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DateRangeSelector from './DateRangeSelector';
import { oneMonthAgoDate, todaysDate } from './AccountUsage.utils';
import { accountProfileStrings } from '../../../../../common/js/config';

function AccountsListUsage({ isLoading, setIsLoading }) {
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(todaysDate);
  const [usageData, setUsageData] = useState({});

  useEffect(() => {
    setIsLoading(true);
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

  return (
    <section>
      <div>
        <h2>{accountProfileStrings.sectionTitles.accountUsage}</h2>
      </div>
      <DateRangeSelector
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      {isLoading && <CircularProgress color="success" />}
      {!isLoading && (
        <div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{accountProfileStrings.accountUsageLabels.organizationName}</TableCell>
                  <TableCell align="right">
                    {accountProfileStrings.accountUsageLabels.numberOfLists}
                  </TableCell>
                  <TableCell align="right">
                    {accountProfileStrings.accountUsageLabels.maxAreaPerList}
                  </TableCell>
                  <TableCell align="right">
                    {accountProfileStrings.accountUsageLabels.totalAreaAnalyzed}
                  </TableCell>
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
