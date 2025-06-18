import { useEffect, useState } from 'react';
import {
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  TextField,
} from '@mui/material';

import { useConvertersContext } from './context/ConvertersContext';
import { StyledTableCell } from '../../common/styledTableCell';
import { PillButton } from '../../../../components';
import ConverterRunsTable from './ConverterRunsTable';

export default function ConvertersList() {
  const { convertersData, isLoading, error, fetchConverters } = useConvertersContext();
  const [orgIdInput, setOrgIdInput] = useState('');

  useEffect(() => {
    fetchConverters();
  }, []);

  if (isLoading) {
    return <div>Loading converters...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!convertersData?.convertersNames.length) {
    return <div>No converters found</div>;
  }

  return (
    <Grid container spacing={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {convertersData?.convertersNames.map((converterName) => (
              <TableRow
                key={converterName}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                }}
              >
                <StyledTableCell>{converterName}</StyledTableCell>
                <StyledTableCell sx={{ display: 'flex', gap: '8px', border: 'none' }}>
                  <TextField
                    sx={{ width: '100px' }}
                    type="number"
                    name="organizationId"
                    placeholder="Org. ID (optional)"
                    value={orgIdInput}
                    onChange={(e) => setOrgIdInput(e.target.value)}
                    inputProps={{ 'data-testid': `org-id-${converterName}` }}
                    size="small"
                  />
                  <PillButton
                    variant="contained"
                    size="small"
                    autoFocus
                    onClick={() => console.log(`Start converter: ${converterName}`)}
                  >
                    Start
                  </PillButton>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ConverterRunsTable converterJobs={convertersData.converterJobs} />
    </Grid>
  );
}
