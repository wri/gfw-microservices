import { useState, useEffect } from 'react';
import errorLogger from '../../../../../common/js/utils/errorLogger';
import { Box, styled } from '@mui/material';

import { oneMonthAgoDate, endDayIncludingToday } from './AccountUsage.utils';
import { useAccountDetail } from '../AccountDetailSection';
import AccountUsage from '../../../../../profile/js/components/AccountUsage/AccountUsage.jsx';
import { LoadingModal } from '../../../../../components';
import { calculateAccountSubscriptionDates } from '../../../../../common/js/utils/accountSubscriptionDates';
import AccountDetailUsageByAnalysisType from '../../../../../profile/js/components/AccountUsage/AccountDetailUsageByAnalysisType.jsx';

const AccountRenewalText = styled('p')({
  marginBottom: '1rem',
  color: 'rgba(0, 0, 0, 0.5)',
  fontSize: '12px',
  textAlign: 'right',
  borderRadius: '5px',
});

function AccountDetailUsage() {
  const { currentAccount } = useAccountDetail();
  const [startDate, setStartDate] = useState(oneMonthAgoDate);
  const [endDate, setEndDate] = useState(endDayIncludingToday);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisUsageByType, setAnalysisUsageByType] = useState([]);

  const { organization_id: organizationId, renewal_time } = currentAccount;
  const { subscriptionYearEnd } = calculateAccountSubscriptionDates(renewal_time);

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `analytics/usage/usage-by-analysis?startDate=${startDate}&endDate=${endDate}&organizationId=${organizationId}`,
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
        setIsLoading(false);
      })
      .catch((error) => {
        errorLogger.error('Error fetching analysis usage by type', {
          component: 'AccountDetailUsage',
          action: 'fetchAnalysisUsageByType',
          error,
          organizationId,
          startDate,
          endDate,
        });
        setAnalysisUsageByType([]);
        setIsLoading(false);
      });
  }, [startDate, endDate]);

  if (isLoading) {
    return <LoadingModal isLoading={true} />;
  }

  return (
    <section>
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          padding: '1em',
          borderRadius: '5px',
        }}
      >
        <AccountRenewalText>Account renewal on {subscriptionYearEnd}</AccountRenewalText>
        <AccountUsageInfoBubbles />
      </Box>
      <AccountDetailUsageByAnalysisType
        analysisUsageByType={analysisUsageByType}
        setStartDateAnalysis={setStartDate}
        setEndDateAnalysis={setEndDate}
        startDateAnalysis={startDate}
        endDateAnalysis={endDate}
        organizationId={organizationId}
      />
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
          errorLogger.warn('Account usage fetch returned unsuccessful', {
            component: 'AccountDetailUsage',
            action: 'fetchAccountUsageData',
            data,
            organizationId,
          });
        }

        const [accountUsage = {}] = data;
        const { limits: accountLimits } = currentAccount.analysis_limits;

        setAccountUsageData({
          total_area_analyzed: accountUsage.total_area_analyzed ?? 0,
          locations_analyzed: accountUsage.locations_analyzed ?? 0,
          total_tokens: accountUsage.total_tokens ?? 0,
          maxLocations: accountLimits.max_locations_per_year ?? 0,
          maxArea: accountLimits.MaxAreaAnalyzeablePerYear ?? 0,
          maxTokens: accountLimits.tokens_per_year ?? 0,
        });
      })
      .catch((error) => {
        errorLogger.error('Error fetching account usage data', {
          component: 'AccountDetailUsage',
          action: 'fetchAccountUsageData',
          error,
          organizationId,
        });
      });
  }, []);

  if (!accountUsageData) {
    return <LoadingModal isLoading={true} />;
  }

  return <AccountUsage {...accountUsageData} />;
}

export default AccountDetailUsage;
