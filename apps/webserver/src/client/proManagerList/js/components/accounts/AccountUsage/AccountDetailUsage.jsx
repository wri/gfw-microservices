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
import { numberWithCommas } from '../../../../../locations/js/utils/locationsTableUtils.js';
import DateRangeSelector from './DateRangeSelector';
import { oneMonthAgoDate, todaysDate } from './AccountUsage.utils';
import { accountProfileStrings } from '../../../../../common/js/config';
import { useAccountDetail } from '../AccountDetailSection';

function AccountDetailUsage() {
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(todaysDate);
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({});
  const { currentAccount } = useAccountDetail();
  const { organization_id: organizationId } = currentAccount;
  const { number_of_lists_analyzed, max_area_analyzed, total_area_analyzed } = usageData;

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `/analytics/usage?startDate=${startDate}&endDate=${endDate}&organizationId=${organizationId}`,
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
        <Grid container justifyContent="center" sx={{ marginTop: '1em' }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{accountProfileStrings.accountUsageLabels.numberOfLists}</TableCell>
                  <TableCell>{accountProfileStrings.accountUsageLabels.maxAreaPerList}</TableCell>
                  <TableCell>
                    {accountProfileStrings.accountUsageLabels.totalAreaAnalyzed}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{numberWithCommas(number_of_lists_analyzed)}</TableCell>
                  <TableCell>{numberWithCommas(max_area_analyzed)}</TableCell>
                  <TableCell>{numberWithCommas(total_area_analyzed)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </section>
  );
}

export default AccountDetailUsage;
