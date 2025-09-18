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
  styled,
} from '@mui/material';

import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';
import AccountUsage from './AccountUsage';
import { useProfileContext } from '../../ProfileStateContext';
import AccountUsageDropMenu from './AccountUsageDropMenu';
import { formatNumber } from '../../../../common/js/utils/format';
import { calculateAccountSubscriptionDates } from '../../../../common/js/utils/accountSubscriptionDates';
import AccountDetailUsageByAnalysisType from './AccountDetailUsageByAnalysisType';
import moment from 'moment';

export default function AccountUsageContainer() {
  const { accountRenewalTime } = useProfileContext();
  const [usageData, setUsageData] = useState(null);
  const [usageLimitsData, setUsageLimitsData] = useState(null);
  const [usageDataperUser, setUsageDataperUser] = useState([]);
  const [messageType, setMessageType] = useState('');
  const [messageText, setMessageText] = useState('');
  const oneMonthAgoDate = moment().subtract(1, 'months').format('YYYY-MM-DD');
  const endDayIncludingToday = moment().add(1, 'day').format('YYYY-MM-DD');
  const [startDateAnalysis, setStartDateAnalysis] = useState(oneMonthAgoDate);
  const [endDateAnalysis, setEndDateAnalysis] = useState(endDayIncludingToday);
  const [analysisUsageByType, setAnalysisUsageByType] = useState([]);

  const { startDate, endDate, subscriptionYearEnd } =
    calculateAccountSubscriptionDates(accountRenewalTime);

  const HeaderTableCell = styled(TableCell)(() => ({
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: 'rgba(0, 0, 0, 0.73)',
    fontSize: '15px',
    fontWeight: 'bold',
  }));

  const renewalTextStyle = {
    margin: '0px 0 30px 0',
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '12px',
    textAlign: 'right',
  };

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
    fetch(`/analytics/myorg/usage/users?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsageDataperUser(data.organizationUsersAnalysisUsage);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

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
    return ((area / usageData.total_area_analyzed) * 100).toFixed(2);
  };

  const getAnalysesPercentage = (locations) => {
    return ((locations / usageData.locations_analyzed) * 100).toFixed(2);
  };

  return usageData === null || usageLimitsData === null ? (
    <InlineLoader />
  ) : (
    <>
      {messageType !== '' && <Alert severity={messageType}>{messageText}</Alert>}
      <p style={renewalTextStyle}>Account renewal on {subscriptionYearEnd}</p>

      <AccountUsageDropMenu export={exportUsage} />
      <h3 style={{ margin: '0px 0 30px 0', fontWeight: 'normal' }}>Summary</h3>

      <AccountUsage
        {...usageData}
        maxArea={usageLimitsData?.MaxAreaAnalyzeablePerYear}
        maxLocations={usageLimitsData?.max_locations_per_year}
      />
      <h3 style={{ margin: '30px 0 20px 0', fontWeight: 'normal' }}>Usage Per Analysis Type</h3>
      <AccountDetailUsageByAnalysisType
        analysisUsageByType={analysisUsageByType}
        setStartDateAnalysis={setStartDateAnalysis}
        setEndDateAnalysis={setEndDateAnalysis}
        startDateAnalysis={startDateAnalysis}
        endDateAnalysis={endDateAnalysis}
      />
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
    </>
  );
}
