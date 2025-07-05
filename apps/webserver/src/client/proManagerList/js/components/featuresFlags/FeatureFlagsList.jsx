import { Grid, Table, TableHead, TableBody, TableRow, TableContainer } from '@mui/material';
import moment from 'moment';

import { useFeatureFlagStateContext } from './FeatureFlagStateContext';
import { StyledTableCell } from '../../common/styledTableCell';

function FeatureFlagsList() {
  const { featureFlagsList, selectedFeatureFlag, setSelectedFeatureFlag } =
    useFeatureFlagStateContext();

  const formatUpdatedTime = (date) => moment(date).format('MM/DD/YYYY - HH:mm');

  return !selectedFeatureFlag ? (
    <Grid container spacing={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Date Modified</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {featureFlagsList.map((flagRow) => (
              <TableRow
                onClick={() => setSelectedFeatureFlag(flagRow)}
                key={flagRow.flagId}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                }}
              >
                <StyledTableCell>{flagRow.flagId}</StyledTableCell>
                <StyledTableCell>
                  {flagRow.updateDateTime ? formatUpdatedTime(flagRow.updateDateTime) : ''}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  ) : null;
}

export default FeatureFlagsList;
