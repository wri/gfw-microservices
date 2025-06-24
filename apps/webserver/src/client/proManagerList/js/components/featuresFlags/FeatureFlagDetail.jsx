import moment from 'moment';
import {
  Grid,
  Switch,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  styled,
} from '@mui/material';

import AddCompany from './AddCompany';
import { useFeatureFlagStateContext } from './FeatureFlagStateContext';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import { StyledTableCell } from '../../common/styledTableCell';

const gridSectionStyle = {
  padding: '20px 0',
  boxShadow: '0px 1px 0px 0px rgba(0, 0, 0, 0.13) inset',
};

const StyledSwitch = styled(Switch)(() => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#8bae3b',
  },
}));

const formatUpdatedTime = (date) => moment(date).format('MM/DD/YYYY - HH:mm');

function FeatureFlagDetail() {
  const { selectedFeatureFlag, accountsWithFeatureFlagsByFlagId, upsertFeatureFlagByFlagId } =
    useFeatureFlagStateContext();

  const handleFeatureFlagStateChange = (flagStateChange, orgId = null) => {
    upsertFeatureFlagByFlagId(flagStateChange, orgId);
  };

  return selectedFeatureFlag ? (
    <>
      <Grid container style={gridSectionStyle}>
        <Grid item xs={6}>
          <label>FEATURE DETAILS</label>
        </Grid>
        <Grid item xs={6}>
          <label>Name</label>
          <div style={{ marginTop: '20px' }}>{selectedFeatureFlag.flagId}</div>
        </Grid>
      </Grid>
      <Grid container style={gridSectionStyle}>
        <Grid item xs={6}>
          <label>STATUS</label>
        </Grid>
        <Grid item xs={6}>
          <label>
            Active for all Organizations
            <StyledSwitch
              checked={selectedFeatureFlag.flagState}
              color="default"
              onChange={(event) => handleFeatureFlagStateChange(event.target.checked)}
            />
            <InfoBubble>
              <h3 class="bubble-title">global switch</h3>
              <p>Individual organizations can still be disabled even if the global switch is on.</p>
            </InfoBubble>
          </label>
        </Grid>
      </Grid>
      <Grid container style={gridSectionStyle}>
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
                          <label>
                            <StyledSwitch
                              checked={featureFlag.flagState}
                              color="default"
                              onChange={(event) =>
                                handleFeatureFlagStateChange(event.target.checked, organization_id)
                              }
                            />
                          </label>
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
    </>
  ) : null;
}

export default FeatureFlagDetail;
