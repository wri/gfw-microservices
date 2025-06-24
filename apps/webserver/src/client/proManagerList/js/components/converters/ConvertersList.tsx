import { useEffect, useState } from 'react';
import {
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  TextField,
  Typography,
} from '@mui/material';

import { StyledTableCell } from '../../common/styledTableCell';
import { PillButton } from '../../../../components';
import ConverterRunsTable from './ConverterRunsTable';
import { useFetch } from '../../../../hooks';
import { fetchConverters } from '../../../../api/converter';

interface ConverterData {
  convertersNames: string[];
  converterJobs: any[]; // replace `any` with actual type if you have it
}

export default function ConvertersList({ setIsLoading, onViewJobDetails }) {
  const [orgIdInput, setOrgIdInput] = useState('');
  const { data: convertersData, error, isLoading, request } = useFetch<ConverterData>();

  useEffect(() => {
    fetchConverters(request);
    setIsLoading(isLoading);
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (isLoading) {
    return <div>Loading converters...</div>;
  }
  if (!convertersData || !convertersData.convertersNames?.length) {
    return <div>No converters found</div>;
  }

  return (
    <Grid container spacing={2} marginTop={2} marginLeft={0}>
      <Typography variant="subtitle1" marginBottom={1}>
        Available
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Action(s)</StyledTableCell>
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
      <ConverterRunsTable
        converterJobs={convertersData.converterJobs}
        onViewJobDetails={onViewJobDetails}
      />
    </Grid>
  );
}
