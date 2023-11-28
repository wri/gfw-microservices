import React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import moment from 'moment';
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
