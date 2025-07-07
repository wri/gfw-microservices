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
import { fetchConverters, startConverter } from '../../../../api/converter';
import { ConvertersData } from './types/converters';

export default function ConvertersList({ setIsLoading, onViewJobDetails }) {
  const [orgIdInputs, setOrgIdInputs] = useState<{ [key: string]: string }>({});
  const {
    data: convertersData,
    error: fetchError,
    isLoading: isLoadingConverters,
    request: fetchConvertersRequest,
  } = useFetch<ConvertersData>();
  const [startingIds, setStartingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConverters(fetchConvertersRequest);
    setIsLoading(isLoadingConverters);
  }, []);

  const {
    error: startError,
    request: startRequest,
    // data: startData,         // TODO: Show success message after starting a converter
    // isLoading: isStarting, // TODO: Show loading state while starting a converter
  } = useFetch<{ message: string; converterId: string }, { error: string }>();

  const handleStart = async (converterName: string) => {
    const organizationId = orgIdInputs[converterName] || null;
    setStartingIds((prev) => new Set(prev).add(converterName));
    try {
      await startConverter(startRequest, converterName, organizationId);
    } finally {
      setStartingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(converterName);
        return newSet;
      });
    }
  };

  const noConvertersFound =
    !convertersData ||
    !convertersData.convertersNames ||
    Object.keys(convertersData.convertersNames).length === 0;

  const converterEntries = convertersData ? Object.entries(convertersData.convertersNames) : [];

  return (
    <Grid container sx={{ mt: 1 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Converters
      </Typography>

      <Grid container>
        {fetchError || startError ? (
          <Typography color="error">
            Error: {(fetchError as any)?.error || (startError as any)?.error || 'Unknown error'}
          </Typography>
        ) : isLoadingConverters ? (
          <LoadingModal isLoading={isLoadingConverters} />
        ) : noConvertersFound ? (
          <Typography>No converters found</Typography>
        ) : (
          <>
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
                  {converterEntries.map(([converterId, converterLabel]) => (
                    <TableRow
                      key={converterId}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell size="small">{converterLabel}</TableCell>
                      <TableCell size="small" sx={{ display: 'flex', gap: '5px', border: 'none' }}>
                        <TextField
                          sx={{ width: '155px', fontSize: '12px' }}
                          type="number"
                          name={`organizationId-${converterId}`}
                          placeholder="Org. ID (optional)"
                          value={orgIdInputs[converterId] || ''}
                          onChange={(e) =>
                            setOrgIdInputs((prev) => ({
                              ...prev,
                              [converterId]: e.target.value,
                            }))
                          }
                          inputProps={{ 'data-testid': `org-id-${converterId}` }}
                          size="small"
                        />
                        <PillButton
                          variant="contained"
                          size="small"
                          autoFocus
                          disabled={startingIds.has(converterId)}
                          onClick={() => handleStart(converterId)}
                        >
                          {startingIds.has(converterId) ? 'Running...' : 'Start'}
                        </PillButton>
                        {startError && (
                          <Typography variant="caption" color="error">
                            {typeof startError.error === 'string'
                              ? startError.error
                              : JSON.stringify(startError.error)}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <ConverterJobsTable
              convertersData={convertersData}
              onViewJobDetails={onViewJobDetails}
            />
          </>
        )}
      </Grid>
    </Grid>
  );
}
