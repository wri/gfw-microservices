import { useState, useMemo } from 'react';
import {
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Box,
} from '@mui/material';
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

import { formatDigit } from '../../../../locations/js/utils/locationsTableUtils.js';
import DateRangeSelector from '../../../../proManagerList/js/components/accounts/AccountUsage/DateRangeSelector.jsx';
import { accountProfileStrings } from '../../../../common/js/config.js';
import { useSortableData } from '../../../../hooks';
import AccountUsageDropMenu from './AccountUsageDropMenu';
import InfoBubble from '../../../../common/js/components/InfoBubble';

/**
 * Possible duplicate contents from
 * {@link libs/constants/src/lib/analysis-types.constants.ts}
 *
 * @summary libs/constants is not buildable and libs/sql complaints about
 * not finding the contents of the filepath above
 */
const NORMALIZED_ANALYSIS_NAMES = {
  AFI: 'Post-2020 Risk Assessment',
  ALERTS: 'Recent Disturbance Alerts',
  FCD: 'Post-2000 Forest Change',
  'ALERTS-BATCH': 'Weekly Alerts',
  GHG: 'GHG Emissions',
};

const WEEKLY_ALERTS_TYPE = 'ALERTS-BATCH';

function SortableHeader({ label, column, orderBy, order, onSort, align = 'right', children }) {
  return (
    <TableCell
      onClick={() => onSort(column)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      align={align}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        }}
      >
        {label}
        {children}
        <span style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: 4 }}>
          <KeyboardArrowUpIcon
            fontSize="small"
            color={orderBy === column && order === 'asc' ? 'primary' : 'disabled'}
          />
          <KeyboardArrowDownIcon
            fontSize="small"
            color={orderBy === column && order === 'desc' ? 'primary' : 'disabled'}
          />
        </span>
      </div>
    </TableCell>
  );
}

function AccountDetailUsageByAnalysisType({
  analysisUsageByType,
  setStartDateAnalysis,
  setEndDateAnalysis,
  startDateAnalysis,
  endDateAnalysis,
  children,
  organizationId,
}) {
  const { sortedData, orderBy, order, handleSort } = useSortableData(analysisUsageByType, {
    defaultOrderBy: 'analysis_type',
    defaultOrder: 'asc',
    numericColumns: ['locations_analyzed', 'hectares_analyzed', 'lists_analyzed', 'total_tokens'],
  });

  const [messageType, setMessageType] = useState('');
  const [messageText, setMessageText] = useState('');

  const isWeeklyAlerts = (analysisType) => analysisType === WEEKLY_ALERTS_TYPE;

  // Calculate totals
  const totals = useMemo(() => {
    if (!sortedData || sortedData.length === 0) {
      return null;
    }

    const nonWeeklyRows = sortedData.filter((r) => r.analysis_type !== WEEKLY_ALERTS_TYPE);

    const totalLocations = sortedData.reduce(
      (sum, r) => sum + (parseFloat(r.locations_analyzed) || 0),
      0
    );
    const totalHectares = sortedData.reduce(
      (sum, r) => sum + (parseFloat(r.hectares_analyzed) || 0),
      0
    );
    // Total lists = sum of non-weekly types only (excludes Weekly Alerts weeks_of_analysis)
    const totalLists = nonWeeklyRows.reduce(
      (sum, r) => sum + (parseFloat(r.lists_analyzed) || 0),
      0
    );
    const totalTokens = sortedData.reduce((sum, r) => sum + (parseFloat(r.total_tokens) || 0), 0);

    return {
      locations_analyzed: totalLocations,
      hectares_analyzed: totalHectares,
      lists_analyzed: totalLists,
      total_tokens: totalTokens,
    };
  }, [sortedData]);

  const handleDownloadConfirmation = (type) => {
    setMessageType(type);

    if (type === 'error') {
      return setMessageText('Something went wrong');
    }

    setMessageText('Success! Your file has been successfully exported.');
  };

  const exportUsage = async () => {
    try {
      const url = organizationId
        ? `/analytics/usage/users/download?orgId=${organizationId}&startDate=${startDateAnalysis}&endDate=${endDateAnalysis}`
        : `/analytics/myorg/usage/users/download?startDate=${startDateAnalysis}&endDate=${endDateAnalysis}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
      });
      if (!response.ok) {
        return handleDownloadConfirmation('error');
      }
      return handleDownloadConfirmation('success');
    } catch {
      handleDownloadConfirmation('error');
    }
  };

  return (
    <section>
      <Divider sx={{ margin: '1.5rem 0' }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'flex-end' }}
        >
          <DateRangeSelector
            startDate={startDateAnalysis}
            setStartDate={setStartDateAnalysis}
            endDate={endDateAnalysis}
            setEndDate={setEndDateAnalysis}
          />
          <span
            style={{
              fontWeight: 'normal',
              backgroundColor: '#f5f5f5',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            Time Zone: UTC
          </span>
          <AccountUsageDropMenu export={exportUsage} />
        </Box>
      </Box>
      <Box
        sx={{
          border: 'solid 1px #d3d3d3',
          padding: '0 2em 2em',
          borderRadius: '12px',
          boxShadow:
            '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          marginBottom: '2em',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: '30px 0 20px 0', fontWeight: 'normal' }}>Detailed Usage</h3>
          {messageType !== '' && <Alert severity={messageType}>{messageText}</Alert>}
        </Box>
        <Grid container justifyContent="center" sx={{ marginTop: '1em' }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>{accountProfileStrings.accountUsageLabels.analysisType}</TableCell>
                  <SortableHeader
                    label={accountProfileStrings.accountUsageLabels.locationsAnalyzed}
                    column="locations_analyzed"
                    orderBy={orderBy}
                    order={order}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={accountProfileStrings.accountUsageLabels.hectaresAnalyzed}
                    column="hectares_analyzed"
                    orderBy={orderBy}
                    order={order}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={accountProfileStrings.accountUsageLabels.listsAnalyzed}
                    column="lists_analyzed"
                    orderBy={orderBy}
                    order={order}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label={accountProfileStrings.accountUsageLabels.tokensUsed}
                    column="total_tokens"
                    orderBy={orderBy}
                    order={order}
                    onSort={handleSort}
                  >
                    <InfoBubble>
                      <p>This usage may reflect the token price across one or more price sheets.</p>
                    </InfoBubble>
                  </SortableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((element) => (
                  <TableRow key={element.analysis_type}>
                    <TableCell>
                      {NORMALIZED_ANALYSIS_NAMES[element.analysis_type] ||
                        element.analysis_type ||
                        ''}
                    </TableCell>
                    <TableCell align="right">
                      {formatDigit(element.locations_analyzed || 0)}
                    </TableCell>
                    <TableCell align="right">
                      {formatDigit(element.hectares_analyzed || 0)}
                    </TableCell>
                    {isWeeklyAlerts(element.analysis_type) ? (
                      <TableCell align="center" sx={{ backgroundColor: '#f5f5f5' }}>
                        <div>
                          {formatDigit(element.lists_analyzed || 0)}
                          <InfoBubble>
                            <p>
                              Weeks of analysis is a sum of the number of lists with Weekly Alerts
                              applied multiplied by the number of weeks each list has been
                              automatically updated. This number is not reflected in the total value
                              listed below.
                            </p>
                          </InfoBubble>
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>Weeks of analysis</div>
                      </TableCell>
                    ) : (
                      <TableCell align="right">
                        {formatDigit(element.lists_analyzed || 0)}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      {element.total_tokens == null ? 'N/A' : formatDigit(element.total_tokens)}
                    </TableCell>
                  </TableRow>
                ))}
                {totals && (
                  <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatDigit(totals.locations_analyzed)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatDigit(totals.hectares_analyzed)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatDigit(totals.lists_analyzed)}
                      <InfoBubble>
                        <p>This sum excludes the &apos;Weeks of analysis&apos; value.</p>
                      </InfoBubble>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatDigit(totals.total_tokens)}
                    </TableCell>
                  </TableRow>
                )}
                {sortedData.length === 0 && (!startDateAnalysis || !endDateAnalysis) ? (
                  <TableRow key="no-data">
                    <TableCell colSpan={5}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: 'auto',
                        }}
                      >
                        {!startDateAnalysis && !endDateAnalysis && (
                          <>Please select both a start date and an end date to display data.</>
                        )}
                        {!startDateAnalysis && endDateAnalysis && (
                          <>Please select a start date to display data.</>
                        )}
                        {startDateAnalysis && !endDateAnalysis && (
                          <>Please select an end date to display data.</>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {children ?? null}
      </Box>
    </section>
  );
}

export default AccountDetailUsageByAnalysisType;
