import { useEffect, useState } from 'react';
import {
  Alert,
  Grid,
  Snackbar,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const { error: startError, request: startConverterRequest } = useFetch<
    { message: string; converterId: string },
    { error: string }
  >();

  const handleStart = async (converterName: string) => {
    const organizationId = orgIdInputs[converterName] || null;
    // Mark as starting immediately
    setStartingIds((prev) => new Set(prev).add(converterName));

    try {
      // Fire off startConverter and fetchConverters concurrently
      const startPromise = startConverter(startConverterRequest, converterName, organizationId);
      await fetchConverters(fetchConvertersRequest); // Kick off fetchConverters but don't await immediately
      await startPromise;
    } catch (error) {
      const message = `Failed to start converter: ${
        error?.error || error?.message || 'Unknown error'
      }`;
      setErrorMessage(message);
    } finally {
      setTimeout(() => {
        setStartingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(converterName); // Remove the converter from startingIds after completion
          return newSet;
        });

        // Trigger a fresh fetch after completion to refresh status accurately
        fetchConverters(fetchConvertersRequest);
      }, 5000);
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
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={4000}
          onClose={() => setErrorMessage(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Alert
            onClose={() => setErrorMessage(null)}
            severity="error"
            sx={{
              mt: 6,
              backgroundColor: '#FFF7F8',
              border: '1px solid #F44336',
              width: '100%',
            }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
}
