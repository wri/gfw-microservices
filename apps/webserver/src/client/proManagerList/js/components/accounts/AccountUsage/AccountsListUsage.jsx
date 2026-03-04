import { useState, useEffect } from 'react';
import errorLogger from '../../../../../common/js/utils/errorLogger';

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
import { LoadingModal } from '../../../../../components';
import featureFlags from '../../../../../../utils/general.utils';

function AccountsListUsage({ setIsLoading }) {
  const { isTokenizationAvailable } = featureFlags;
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
        errorLogger.error('Error fetching accounts usage data', {
          component: 'AccountsListUsage',
          action: 'fetchUsageData',
          error,
          startDate,
          endDate,
        });
        setIsFetching(false);
      });
  }, [startDate, endDate]);

  return (
    <section>
      <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h3">{accountProfileStrings.sectionTitles.accountUsage}</Typography>
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
        {isFetching && <LoadingModal isLoading={true} />}
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
                  <TableCell align="right">
                    {isTokenizationAvailable
                      ? accountProfileStrings.accountUsageLabels.tokens
                      : accountProfileStrings.accountUsageLabels.locationsAnalyzed}
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
                    <TableCell align="right">{numberWithCommas(row.locations_analyzed)}</TableCell>
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
