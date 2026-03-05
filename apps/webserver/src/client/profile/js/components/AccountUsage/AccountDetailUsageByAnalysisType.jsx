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
  Tooltip,
} from '@mui/material';
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { formatDigit } from '../../../../locations/js/utils/locationsTableUtils.js';
import DateRangeSelector from '../../../../proManagerList/js/components/accounts/AccountUsage/DateRangeSelector.jsx';
import { accountProfileStrings } from '../../../../common/js/config.js';
import { useSortableData } from '../../../../hooks';
import AccountUsageDropMenu from './AccountUsageDropMenu';
import featureFlags from '../../../../../utils/general.utils';

/**
 * Possible duplicate contents from
 * {@link libs/constants/src/lib/analysisTypes.constants.ts}
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

function AccountDetailUsageByAnalysisType({
  analysisUsageByType,
  setStartDateAnalysis,
  setEndDateAnalysis,
  startDateAnalysis,
  endDateAnalysis,
  children,
  organizationId,
}) {
  const { isTokenizationAvailable } = featureFlags;

  const { sortedData, orderBy, order, handleSort } = useSortableData(analysisUsageByType, {
    defaultOrderBy: 'analysis_type',
    defaultOrder: 'asc',
    numericColumns: ['locations_analyzed', 'hectares_analyzed', 'lists_analyzed', 'total_tokens'],
  });

  const [messageType, setMessageType] = useState('');
  const [messageText, setMessageText] = useState('');

  // Calculate totals
  const totals = useMemo(() => {
    if (!analysisUsageByType || analysisUsageByType.length === 0) {
      return {
        locationsAnalyzed: 0,
        hectaresAnalyzed: 0,
        listsAnalyzed: 0,
        tokensUsed: 0,
      };
    }

    const locationsAnalyzed = analysisUsageByType
      .filter((item) => item.analysis_type !== 'ALERTS-BATCH') // Exclude Weekly Alerts from total
      .reduce((sum, item) => sum + (parseInt(item.locations_analyzed) || 0), 0);

    const hectaresAnalyzed = analysisUsageByType
      .filter((item) => item.analysis_type !== 'ALERTS-BATCH') // Exclude Weekly Alerts from total
      .reduce((sum, item) => sum + (parseFloat(item.hectares_analyzed) || 0), 0);

    const listsAnalyzed = analysisUsageByType
      .filter((item) => item.analysis_type !== 'ALERTS-BATCH') // Exclude Weekly Alerts from lists total
      .reduce((sum, item) => sum + (parseInt(item.lists_analyzed) || 0), 0);

    const tokensUsed = analysisUsageByType.reduce((sum, item) => {
      const value = item.total_tokens;
      if (value === null || value === undefined) {
        return sum;
      }
      const numeric = parseFloat(value);
      if (Number.isNaN(numeric)) {
        return sum;
      }
      return sum + numeric;
    }, 0);

    return {
      locationsAnalyzed,
      hectaresAnalyzed,
      listsAnalyzed,
      tokensUsed,
    };
  }, [analysisUsageByType]);

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
        ? `/analytics/usage/users/download?orgId=${organizationId}`
        : `/analytics/myorg/usage/users/download`;
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
                  {!isTokenizationAvailable && (
                    <TableCell
                      onClick={() => handleSort('locations_analyzed')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      align="right"
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {accountProfileStrings.accountUsageLabels.locationsAnalyzed}
                        <span
                          style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: 4 }}
                        >
                          <KeyboardArrowUpIcon
                            fontSize="small"
                            color={
                              orderBy === 'locations_analyzed' && order === 'asc'
                                ? 'primary'
                                : 'disabled'
                            }
                          />
                          <KeyboardArrowDownIcon
                            fontSize="small"
                            color={
                              orderBy === 'locations_analyzed' && order === 'desc'
                                ? 'primary'
                                : 'disabled'
                            }
                          />
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {!isTokenizationAvailable && (
                    <TableCell
                      onClick={() => handleSort('hectares_analyzed')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      align="right"
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {accountProfileStrings.accountUsageLabels.hectaresAnalyzed}
                        <span
                          style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: 4 }}
                        >
                          <KeyboardArrowUpIcon
                            fontSize="small"
                            color={
                              orderBy === 'hectares_analyzed' && order === 'asc'
                                ? 'primary'
                                : 'disabled'
                            }
                          />
                          <KeyboardArrowDownIcon
                            fontSize="small"
                            color={
                              orderBy === 'hectares_analyzed' && order === 'desc'
                                ? 'primary'
                                : 'disabled'
                            }
                          />
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell
                    onClick={() => handleSort('lists_analyzed')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    align="right"
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      {accountProfileStrings.accountUsageLabels.listsAnalyzed}
                      <span
                        style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: 4 }}
                      >
                        <KeyboardArrowUpIcon
                          fontSize="small"
                          color={
                            orderBy === 'lists_analyzed' && order === 'asc' ? 'primary' : 'disabled'
                          }
                        />
                        <KeyboardArrowDownIcon
                          fontSize="small"
                          color={
                            orderBy === 'lists_analyzed' && order === 'desc'
                              ? 'primary'
                              : 'disabled'
                          }
                        />
                      </span>
                    </div>
                  </TableCell>
                  {isTokenizationAvailable && (
                    <TableCell
                      onClick={() => handleSort('total_tokens')}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      align="right"
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {accountProfileStrings.accountUsageLabels.tokensUsed}
                        <span
                          style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: 4 }}
                        >
                          <KeyboardArrowUpIcon
                            fontSize="small"
                            color={
                              orderBy === 'total_tokens' && order === 'asc' ? 'primary' : 'disabled'
                            }
                          />
                          <KeyboardArrowDownIcon
                            fontSize="small"
                            color={
                              orderBy === 'total_tokens' && order === 'desc'
                                ? 'primary'
                                : 'disabled'
                            }
                          />
                        </span>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((element) => {
                  return (
                    <TableRow key={element.analysis_type}>
                      <TableCell>
                        {NORMALIZED_ANALYSIS_NAMES[element.analysis_type] ||
                          element.analysis_type ||
                          ''}
                      </TableCell>
                      {!isTokenizationAvailable && (
                        <TableCell align="right">
                          {formatDigit(element.locations_analyzed || 0)}
                        </TableCell>
                      )}
                      {!isTokenizationAvailable && (
                        <TableCell align="right">
                          {formatDigit(element.hectares_analyzed || 0)}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {isTokenizationAvailable && element.analysis_type === 'ALERTS-BATCH' ? (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {formatDigit(element.lists_analyzed || 0)}
                              <Tooltip
                                title="Weeks of analysis is a sum of the number of lists with Weekly Alerts applied multiplied by the number of weeks each list has been automatically updated. This number is not reflected in the total listed below."
                                arrow
                                placement="top"
                              >
                                <InfoIcon
                                  sx={{
                                    fontSize: '16px',
                                    color: 'rgba(0, 0, 0, 0.54)',
                                    cursor: 'help',
                                  }}
                                />
                              </Tooltip>
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'rgba(0, 0, 0, 0.5)',
                                marginTop: '4px',
                              }}
                            >
                              Weeks of analysis
                            </div>
                          </div>
                        ) : (
                          formatDigit(element.lists_analyzed || 0)
                        )}
                      </TableCell>
                      {isTokenizationAvailable && (
                        <TableCell align="right">
                          {formatDigit(element.total_tokens || 'N/A')}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {sortedData.length > 0 && (
                  <TableRow
                    key="total-row"
                    sx={{
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold',
                      '& td': { fontWeight: 'bold' },
                    }}
                  >
                    <TableCell>
                      {accountProfileStrings.accountUsageLabels.totalLabel || 'Total'}
                    </TableCell>
                    {!isTokenizationAvailable && (
                      <TableCell align="right">{formatDigit(totals.locationsAnalyzed)}</TableCell>
                    )}
                    {!isTokenizationAvailable && (
                      <TableCell align="right">{formatDigit(totals.hectaresAnalyzed)}</TableCell>
                    )}
                    <TableCell align="right">{formatDigit(totals.listsAnalyzed)}</TableCell>
                    {isTokenizationAvailable && (
                      <TableCell align="right">{formatDigit(totals.tokensUsed)}</TableCell>
                    )}
                  </TableRow>
                )}
                {sortedData.length === 0 && (!startDateAnalysis || !endDateAnalysis) ? (
                  <TableRow key="no-data">
                    <TableCell colSpan={isTokenizationAvailable ? 3 : 4}>
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
