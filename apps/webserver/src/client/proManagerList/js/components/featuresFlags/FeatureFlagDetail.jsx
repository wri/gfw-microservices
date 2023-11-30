import React, { Fragment } from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import moment from 'moment';
import AddCompany from './AddCompany';
import { useFeatureFlagStateContext } from './FeatureFlagStateContext';

const StyledTableCell = styled(TableCell)(() => ({
  fontFamily: 'Fira Sans, sans-serif',
  [`&.${tableCellClasses.head}`]: {
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    color: '#4e4e4ede',
  },
}));

const StyledSwitch = styled(Switch)(() => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#8bae3b',
  },
}));

const formatUpdatedTime = (date) => moment(date).format('MM/DD/YYYY - HH:mm');

function FeatureFlagDetail() {
  const { selectedFeatureFlag, accountsWithFeatureFlagsByFlagId, upsertFeatureFlagByFlagId } =
    useFeatureFlagStateContext();
  const statusLabel = selectedFeatureFlag?.flagState ? 'Active' : 'Inactive';

  const handleFeatureFlagStateChange = (flagStateChange, orgId = null) => {
    upsertFeatureFlagByFlagId(flagStateChange, orgId);
  };

  return selectedFeatureFlag ? (
    <Fragment>
      <Grid
        container
        style={{ padding: '20px 0', boxShadow: '0px 1px 0px 0px rgba(0, 0, 0, 0.13) inset' }}
      >
        <Grid item xs={6}>
          <label>FEATURE DETAILS</label>
        </Grid>
        <Grid item xs={6}>
          <label>Name</label>
          <div style={{ marginTop: '20px' }}>{selectedFeatureFlag.flagId}</div>
        </Grid>
      </Grid>
      <Grid
        container
        style={{ padding: '20px 0', boxShadow: '0px 1px 0px 0px rgba(0, 0, 0, 0.13) inset' }}
      >
        <Grid item xs={6}>
          <label>STATUS</label>
        </Grid>
        <Grid item xs={6}>
          {statusLabel}
          <StyledSwitch
            checked={selectedFeatureFlag.flagState}
            color="default"
            onChange={(event) => handleFeatureFlagStateChange(event.target.checked)}
          />
        </Grid>
      </Grid>
      <Grid
        container
        style={{ padding: '20px 0', boxShadow: '0px 1px 0px 0px rgba(0, 0, 0, 0.13) inset' }}
      >
        <Grid item xs={6}>
          <label>ACCOUNTS</label>
        </Grid>
        <Grid item xs={6}>
          {accountsWithFeatureFlagsByFlagId.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell>Organization</StyledTableCell>
                    <StyledTableCell>Date Activated</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountsWithFeatureFlagsByFlagId.map((accountFeatureFlagRow, rowIndex) => {
                    const { featureFlag, organization_id, organization_name } =
                      accountFeatureFlagRow;
                    return (
                      <TableRow
                        key={rowIndex}
                        sx={{
                          '&:last-child td': {
                            border: 0,
                          },
                          cursor: 'pointer',
                        }}
                      >
                        <StyledTableCell>{organization_id}</StyledTableCell>
                        <StyledTableCell>{organization_name}</StyledTableCell>
                        <StyledTableCell>
                          {featureFlag.updateDateTime
                            ? formatUpdatedTime(featureFlag.updateDateTime)
                            : ''}
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledSwitch
                            checked={featureFlag.flagState}
                            color="default"
                            onChange={(event) =>
                              handleFeatureFlagStateChange(event.target.checked, organization_id)
                            }
                          />
                        </StyledTableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
          <AddCompany />
        </Grid>
      </Grid>
    </Fragment>
  ) : null;
}

export default FeatureFlagDetail;
