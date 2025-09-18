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

function AccountDetailUsageByAnalysisType({
  analysisUsageByType,
  setStartDateAnalysis,
  setEndDateAnalysis,
  startDateAnalysis,
  endDateAnalysis,
}) {
  return (
    <section>
      <Divider sx={{ margin: '1.5rem 0' }} />
      <DateRangeSelector
        startDate={startDateAnalysis}
        setStartDate={setStartDateAnalysis}
        endDate={endDateAnalysis}
        setEndDate={setEndDateAnalysis}
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
              {analysisUsageByType &&
                analysisUsageByType.map((element) => (
                  <TableRow>
                    <TableCell>{element.analysis_type || ''}</TableCell>
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
