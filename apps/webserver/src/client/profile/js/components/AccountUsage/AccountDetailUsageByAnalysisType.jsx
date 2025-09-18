import { useState, useEffect } from 'react';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';

import { numberWithCommas } from '../../../../locations/js/utils/locationsTableUtils.js';
import DateRangeSelector from '../../../../proManagerList/js/components/accounts/AccountUsage/DateRangeSelector.jsx';
import { accountProfileStrings } from '../../../../common/js/config.js';
import moment from 'moment';

function AccountDetailUsageByAnalysisType() {
  
  const oneMonthAgoDate = moment().subtract(1, 'months').format('YYYY-MM-DD');
  const endDayIncludingToday = moment().add(1, 'day').format('YYYY-MM-DD');
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(endDayIncludingToday);
   const [ analysisUsageByType, setAnalysisUsageByType ] = useState([]);


  useEffect(() => {
    fetch(
        `/analytics/myorg/usage/usage-by-analysis?startDate=${startDate}&endDate=${endDate}`,
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
          const { analysisUsageByType } = data;
          setAnalysisUsageByType(analysisUsageByType);
          console.log('usage-by-analysis', analysisUsageByType);
        })
        .catch((error) => {
          console.log('Error on fetch usage-by-analysis:', error);
        });
  }, [startDate, endDate]);

  return (
    <section>
      <Divider sx={{ margin: '1.5rem 0' }} />
      <DateRangeSelector
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
        <Grid container justifyContent="center" sx={{ marginTop: '1em' }}>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>{accountProfileStrings.accountUsageLabels.analysisType}</TableCell>
                  <TableCell>{accountProfileStrings.accountUsageLabels.locationsAnalyzed}</TableCell>
                  <TableCell>{accountProfileStrings.accountUsageLabels.hectaresAnalyzed}</TableCell>
                  <TableCell>{accountProfileStrings.accountUsageLabels.listsAnalyzed}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {analysisUsageByType && analysisUsageByType.map(element => (
                <TableRow>
                  <TableCell>{(element.analysis_type || "")}</TableCell>
                  <TableCell>{numberWithCommas(element.locations_analyzed || 0)}</TableCell>
                  <TableCell>{numberWithCommas(element.hectares_analyzed || 0)}</TableCell>
                  <TableCell>{numberWithCommas(element.lists_analyzed || 0)}</TableCell>
                </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      <Divider sx={{ margin: '1.5rem 0' }} />
    </section>
  );
}


export default AccountDetailUsageByAnalysisType;
