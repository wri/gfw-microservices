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

import { formatDigit } from '../../../../locations/js/utils/locationsTableUtils.js';
import DateRangeSelector from '../../../../proManagerList/js/components/accounts/AccountUsage/DateRangeSelector.jsx';
import { accountProfileStrings } from '../../../../common/js/config.js';

const NORMALIZING_ANALYSIS_NAMES = {
  AFI: 'Post-2020 Risk Assessment',
  ALERTS: 'Recent Deforestation Alerts',
  FCD: 'Post-2000 Forest Change',
  GHG: 'GHG Emissions',
};

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
      <h3 style={{ margin: '30px 0 20px 0', fontWeight: 'normal' }}>Detailed Usage</h3>
      <Grid container justifyContent="center" sx={{ marginTop: '1em' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>{accountProfileStrings.accountUsageLabels.analysisType}</TableCell>
                <TableCell>{accountProfileStrings.accountUsageLabels.locationsAnalyzed}</TableCell>
                <TableCell>{accountProfileStrings.accountUsageLabels.hectaresAnalyzed}</TableCell>
                <TableCell>{accountProfileStrings.accountUsageLabels.listsAnalyzed}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analysisUsageByType &&
                analysisUsageByType.map((element) => (
                  <TableRow key={element.analysis_type}>
                    <TableCell>
                      {NORMALIZING_ANALYSIS_NAMES[element.analysis_type] ||
                        element.analysis_type ||
                        ''}
                    </TableCell>
                    <TableCell>{formatDigit(element.locations_analyzed || 0)}</TableCell>
                    <TableCell>{formatDigit(element.hectares_analyzed || 0)}</TableCell>
                    <TableCell>{formatDigit(element.lists_analyzed || 0)}</TableCell>
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
