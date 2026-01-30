import React from 'react';
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
  Box,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { formatDigit } from '../../../../locations/js/utils/locationsTableUtils.js';
import DateRangeSelector from '../../../../proManagerList/js/components/accounts/AccountUsage/DateRangeSelector.jsx';
import { accountProfileStrings } from '../../../../common/js/config.js';

/**
 * Posbile duplicate contents from
 * {@link libs/constants/src/lib/analysisTypes.constants.ts}
 *
 * @summary libs/constants is not buildable and libs/sql complaints about
 * not finding the contents of the filepath above
 */
const NORMALIZING_ANALYSIS_NAMES = {
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
}) {
  const [orderBy, setOrderBy] = React.useState('analysis_type');
  const [order, setOrder] = React.useState('asc');

  const handleSort = (column) => {
    if (orderBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!analysisUsageByType) {
      return [];
    }
    return [...analysisUsageByType].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];
      // For numeric columns, parse as float
      if (['locations_analyzed', 'hectares_analyzed', 'lists_analyzed'].includes(orderBy)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
          bValue = bValue.toLowerCase();
        }
      }
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [analysisUsageByType, orderBy, order]);

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
        <h3 style={{ margin: '30px 0 20px 0', fontWeight: 'normal' }}>Detailed Usage</h3>
        <Grid container justifyContent="center" sx={{ marginTop: '1em' }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>{accountProfileStrings.accountUsageLabels.analysisType}</TableCell>
                  <TableCell
                    onClick={() => handleSort('locations_analyzed')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
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
                  <TableCell
                    onClick={() => handleSort('hectares_analyzed')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
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
                  <TableCell
                    onClick={() => handleSort('lists_analyzed')}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((element) => (
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
                {sortedData.length === 0 && (!startDateAnalysis || !endDateAnalysis) ? (
                  <TableRow key="no-data">
                    <TableCell colSpan={4}>
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
