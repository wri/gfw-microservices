import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import InlineLoader from '../../../../common/js/components/Loaders/InlineLoader';
import AccountUsage from './AccountUsage';
import moment from 'moment';
import { useProfileContext } from '../../ProfileStateContext';

export default function AccountUsageContainer() {
  const { accountActivatedTime } = useProfileContext();
  const [usageData, setUsageData] = useState(null);
  const [usageLimitsData, setUsageLimitsData] = useState(null);
  const [usageDataperUser, setUsageDataperUser] = useState([]);
  const todayAsEndDay = moment();
  const accountActivationDate = moment(accountActivatedTime);
  const accountLatestYearStartDate = todayAsEndDay
    .clone()
    .subtract(moment().diff(accountActivationDate, 'days') % 365, 'days');

  const subscriptionYearEnd = accountLatestYearStartDate.clone().add(1, 'years').format('LL');

  const HeaderTableCell = styled(TableCell)(() => ({
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    color: 'rgba(0, 0, 0, 0.73)',
    fontSize: '15px',
    fontWeight: 'bold',
  }));

  const renewalTextStyle = {
    margin: '0px 0 30px 0',
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: '10px',
    float: 'right',
  };

  useEffect(() => {
    fetch(
      `/analytics/myorg/usage?startDate=${accountLatestYearStartDate.format(
        'YYYY-MM-DD'
      )}&endDate=${todayAsEndDay.format('YYYY-MM-DD')}`,
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
        const [usageData] = data;
        setUsageData(usageData);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    fetch(
      `/analytics/myorg/usage/users?startDate=${accountLatestYearStartDate.format(
        'YYYY-MM-DD'
      )}&endDate=${todayAsEndDay.format('YYYY-MM-DD')}`,
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
        setUsageDataperUser(data.organizationUsersAnalysisUsage);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    return fetch(`analytics/myorg/limit`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, `analytics/myorg/limit`)
        setUsageLimitsData(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const getAreasPercentage = (area) => {
    return ((area / usageData.max_area_analyzed) * 100).toFixed(3);
  };

  const getAnalysesPercentage = (locations) => {
    return ((locations / usageData.locations_analyzed) * 100).toFixed(3);
  };

  return usageData === null ? (
    <InlineLoader />
  ) : (
    <>
      <p style={renewalTextStyle}>Account renewal on {subscriptionYearEnd}</p>
      <h3 style={{ margin: '0px 0 30px 0', fontWeight: 'normal' }}>Summary</h3>
      <AccountUsage
        {...usageData}
        maxArea={usageLimitsData?.MaxAreaAnalyzeablePerYear}
        maxLocations={usageLimitsData?.max_locations_per_year} />

      <h3 style={{ margin: '30px 0 20px 0', fontWeight: 'normal' }}>History</h3>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <HeaderTableCell>User</HeaderTableCell>
              <HeaderTableCell align="right"># Analyses (% of Total used)</HeaderTableCell>
              <HeaderTableCell align="right">Areas (% of Total used)</HeaderTableCell>
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
                  {getAnalysesPercentage(row.total_locations_analyzed)}%
                </TableCell>
                <TableCell align="right">{getAreasPercentage(row.total_area_analyzed)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
