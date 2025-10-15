import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';

import { numberWithCommas } from '../../../../../locations/js/utils/locationsTableUtils.js';
import { oneMonthAgoDate, endDayIncludingToday } from './AccountUsage.utils';
import { accountProfileStrings } from '../../../../../common/js/config';
import { useAccountDetail } from '../AccountDetailSection';
import AccountUsage from '../../../../../profile/js/components/AccountUsage/AccountUsage.jsx';
import { LoadingModal } from '../../../../../components';
import { calculateAccountSubscriptionDates } from '../../../../../common/js/utils/accountSubscriptionDates';
import AccountDetailUsageByAnalysisType from '../../../../../profile/js/components/AccountUsage/AccountDetailUsageByAnalysisType.jsx';

function AccountDetailUsage() {
  const { currentAccount } = useAccountDetail();
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(endDayIncludingToday);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRangeAccountData, setDateRangeAccountData] = useState({});
  const [analysisUsageByType, setAnalysisUsageByType] = useState([]);

  const { organization_id: organizationId, organization_name } = currentAccount;
  const { number_of_lists_analyzed, max_area_analyzed, total_area_analyzed } = dateRangeAccountData;

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
        setDateRangeAccountData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setDateRangeAccountData({});
        setIsLoading(false);
      });

    fetch(
      `analytics/usage/usage-by-analysis?startDate=${startDate}&endDate=${endDate}&organizationName=${organization_name}`,
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
        console.log(error);
        setAnalysisUsageByType([]);
        setIsLoading(false);
      });
  }, [startDate, endDate]);

  if (isLoading) {
    return <LoadingModal isLoading={true} />;
  }

  return (
    <section>
      <AccountUsageInfoBubbles />
      <AccountDetailUsageByAnalysisType
        analysisUsageByType={analysisUsageByType}
        setStartDateAnalysis={setStartDate}
        setEndDateAnalysis={setEndDate}
        startDateAnalysis={startDate}
        endDateAnalysis={endDate}
      >
        {!isLoading && (
          <Grid container justifyContent="center" sx={{ marginTop: '2em' }}>
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
      </AccountDetailUsageByAnalysisType>
    </section>
  );
}

function AccountUsageInfoBubbles() {
  const { currentAccount } = useAccountDetail();
  const { organization_id: organizationId, renewal_time: renewalTime } = currentAccount;
  const [accountUsageData, setAccountUsageData] = useState(null);

  const { startDate, endDate } = calculateAccountSubscriptionDates(renewalTime);

  useEffect(() => {
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
      .then((data) => {
        if (data?.success === false) {
          console.warn(data);
        }

        const [accountUsage = {}] = data;
        const { limits: accountLimits } = currentAccount.analysis_limits;

        setAccountUsageData({
          total_area_analyzed: accountUsage.total_area_analyzed ?? 0,
          locations_analyzed: accountUsage.locations_analyzed ?? 0,
          maxLocations: accountLimits.max_locations_per_year ?? 0,
          maxArea: accountLimits.MaxAreaAnalyzeablePerYear ?? 0,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  if (!accountUsageData) {
    return <LoadingModal isLoading={true} />;
  }

  return <AccountUsage {...accountUsageData} />;
}

export default AccountDetailUsage;
