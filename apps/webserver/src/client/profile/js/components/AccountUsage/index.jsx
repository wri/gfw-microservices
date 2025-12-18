import { useEffect, useState } from 'react';
import {
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  styled,
} from '@mui/material';

import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';
import AccountUsage from './AccountUsage';
import { useProfileContext } from '../../ProfileStateContext';
import AccountUsageDropMenu from './AccountUsageDropMenu';
import { formatNumber } from '../../../../common/js/utils/format';
import { calculateAccountSubscriptionDates } from '../../../../common/js/utils/accountSubscriptionDates';
import AccountDetailUsageByAnalysisType from './AccountDetailUsageByAnalysisType';
import { subMonths, format } from 'date-fns';

const HeaderTableCell = styled(TableCell)(() => ({
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  color: 'rgba(0, 0, 0, 0.73)',
  fontSize: '15px',
  fontWeight: 'bold',
}));

const AccountRenewalText = styled('p')({
  marginBottom: '1rem',
  color: 'rgba(0, 0, 0, 0.5)',
  fontSize: '12px',
  textAlign: 'right',
  borderRadius: '5px',
});

export default function AccountUsageContainer() {
  const { accountRenewalTime } = useProfileContext();
  const [usageData, setUsageData] = useState(null);
  const [usageLimitsData, setUsageLimitsData] = useState(null);
  const [usageDataperUser, setUsageDataperUser] = useState([]);
  const [messageType, setMessageType] = useState('');
  const [messageText, setMessageText] = useState('');
  const oneMonthAgoDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd');
  const endDayIncludingToday = format(new Date(), 'yyyy-MM-dd');
  const [startDateAnalysis, setStartDateAnalysis] = useState(oneMonthAgoDate);
  const [endDateAnalysis, setEndDateAnalysis] = useState(endDayIncludingToday);
  const [analysisUsageByType, setAnalysisUsageByType] = useState([]);

  const { startDate, endDate, subscriptionYearEnd } =
    calculateAccountSubscriptionDates(accountRenewalTime);

  useEffect(() => {
    fetch(`/analytics/myorg/usage?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(([usageData]) => {
        setUsageData(usageData);
      })
      .catch((error) => {
        console.log(error);
        setUsageData({});
      });
  }, []);

  useEffect(() => {
    fetch(
      `/analytics/myorg/usage/users?startDate=${startDateAnalysis}&endDate=${endDateAnalysis}`,
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
        const { organizationUsersAnalysisUsage = [] } = data;
        setUsageDataperUser(organizationUsersAnalysisUsage);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [startDateAnalysis, endDateAnalysis]);

  useEffect(() => {
    fetch(`analytics/myorg/limits`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const { limits } = data;
        setUsageLimitsData(limits);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const exportUsage = () => {
    return fetch(`analytics/myorg/usage/users/download`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then(() => handleDownloadConfirmation('success'))
      .catch(() => {
        handleDownloadConfirmation('error');
      });
  };

  useEffect(() => {
    fetch(
      `/analytics/myorg/usage/usage-by-analysis?startDate=${startDateAnalysis}&endDate=${endDateAnalysis}`,
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
      })
      .catch((error) => {
        console.log('Error on fetch usage-by-analysis:', error);
      });
  }, [startDateAnalysis, endDateAnalysis]);

  const handleDownloadConfirmation = (type) => {
    setMessageType(type);

    if (type == 'error') {
      return setMessageText('Something Went Wrong');
    }

    setMessageText('Success! Your file has been successfully exported.');
  };

  const getAreasPercentage = (area) => {
    const totalAreaAnalyzed = usageDataperUser.reduce(
      (acc, user) => acc + user.total_area_analyzed,
      0
    );
    return totalAreaAnalyzed === 0 ? '0.00' : ((area / totalAreaAnalyzed) * 100).toFixed(2);
  };

  const getAnalysesPercentage = (locations) => {
    // the percentage denominator should be the sum of users analyses, not the max allowed
    const totalLocationsAnalyzed = usageDataperUser.reduce(
      (acc, user) => acc + user.total_locations_analyzed,
      0
    );
    return totalLocationsAnalyzed === 0
      ? '0.00'
      : ((locations / totalLocationsAnalyzed) * 100).toFixed(2);
  };

  return usageData === null || usageLimitsData === null ? (
    <InlineLoader />
  ) : (
    <>
      {messageType !== '' && <Alert severity={messageType}>{messageText}</Alert>}

      <AccountUsageDropMenu export={exportUsage} />
      <h3 style={{ margin: '0px 0 30px 0', fontWeight: 'normal' }}>Summary</h3>

      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          padding: '1em',
          borderRadius: '5px',
        }}
      >
        <AccountRenewalText>Account renewal on {subscriptionYearEnd}</AccountRenewalText>
        <AccountUsage
          {...usageData}
          maxArea={usageLimitsData?.MaxAreaAnalyzeablePerYear}
          maxLocations={usageLimitsData?.max_locations_per_year}
        />
      </Box>

      <AccountDetailUsageByAnalysisType
        analysisUsageByType={analysisUsageByType}
        setStartDateAnalysis={setStartDateAnalysis}
        setEndDateAnalysis={setEndDateAnalysis}
        startDateAnalysis={startDateAnalysis}
        endDateAnalysis={endDateAnalysis}
      >
        <h3 style={{ margin: '30px 0 20px 0', fontWeight: 'normal' }}>Usage Per User</h3>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <HeaderTableCell>User</HeaderTableCell>
                <HeaderTableCell align="right"># Analyses (% of Total used)</HeaderTableCell>
                <HeaderTableCell align="right">Area (% of Total used)</HeaderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usageDataperUser.map((row) => (
                <TableRow
                  key={row.user_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.first_name} {row.last_name}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.total_locations_analyzed)} (
                    {getAnalysesPercentage(row.total_locations_analyzed)}%)
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.total_area_analyzed)} (
                    {getAreasPercentage(row.total_area_analyzed)}%)
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccountDetailUsageByAnalysisType>
    </>
  );
}
