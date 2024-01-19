import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DateRangeSelector from './DateRangeSelector';
import { oneMonthAgoDate, endDayIncludingToday } from './AccountUsage.utils';
import { accountProfileStrings } from '../../../../../common/js/config';
import { numberWithCommas } from '../../../../../locations/js/utils/locationsTableUtils.js';

const fontStyles = {
  fontFamily: 'Fira Sans, sans-serif',
  textTransform: 'uppercase',
  color: '#555555',
  fontSize: '28px',
};

function AccountsListUsage({ setIsLoading }) {
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(endDayIncludingToday);
  const [usageData, setUsageData] = useState({});
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => setIsLoading(false), []);

  useEffect(() => {
    setIsFetching(true);
    fetch(`/analytics/usage?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsageData(data);
        setIsFetching(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [startDate, endDate]);

  return (
    <section>
      <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
        <Typography sx={fontStyles} variant="h2">
          {accountProfileStrings.sectionTitles.accountUsage}
        </Typography>
      </Grid>

      <Box sx={{ marginBottom: '1.5rem' }}>
        <DateRangeSelector
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </Box>

      <Grid container justifyContent="center">
        {isFetching && <CircularProgress color="success" />}
        {!isFetching && (
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
                      {`${row.organization_id}: ${row.organization_name}`}
                    </TableCell>
                    <TableCell align="right">
                      {numberWithCommas(row.number_of_lists_analyzed)}
                    </TableCell>
                    <TableCell align="right">{numberWithCommas(row.max_area_analyzed)}</TableCell>
                    <TableCell align="right">{numberWithCommas(row.total_area_analyzed)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>
    </section>
  );
}

export default AccountsListUsage;
