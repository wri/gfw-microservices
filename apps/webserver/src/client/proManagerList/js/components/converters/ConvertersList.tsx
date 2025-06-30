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
  TableCell,
} from '@mui/material';

import { StyledTableCell } from '../../common/styledTableCell';
import { LoadingModal, PillButton } from '../../../../components';
import { useFetch } from '../../../../hooks';

import ConverterJobsTable from './ConverterJobsTable';
import { fetchConverters } from '../../../../api/converter';
import { ConvertersData } from './types/converters';

export default function ConvertersList({ setIsLoading, onViewJobDetails }) {
  const [orgIdInput, setOrgIdInput] = useState('');
  const { data: convertersData, error, isLoading, request } = useFetch<ConvertersData>();

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
    <Grid container sx={{ mt: 1 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Converters
      </Typography>

      {error ? (
        <Typography color="error">Error: {error}</Typography>
      ) : isLoading ? (
        <LoadingModal isLoading={isLoading} />
      ) : !convertersData?.convertersNames?.length ? (
        <Typography>No converters found</Typography>
      ) : (
        <Grid container>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
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
                {convertersData.convertersNames.map((converterName) => (
                  <TableRow
                    key={converterName}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                    }}
                  >
                    <TableCell size="small">{converterName}</TableCell>
                    <TableCell size="small" sx={{ display: 'flex', gap: '5px', border: 'none' }}>
                      <TextField
                        sx={{ width: '155px', fontSize: '12px' }}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <ConverterJobsTable convertersData={convertersData} onViewJobDetails={onViewJobDetails} />
        </Grid>
      )}
    </Grid>
  );
}
