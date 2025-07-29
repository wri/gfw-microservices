import { useEffect, useState } from 'react';
import {
  Alert,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Snackbar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  TextField,
  Typography,
  TableCell,
  Select,
} from '@mui/material';

import { StyledTableCell } from '../../common/styledTableCell';
import { LoadingModal, PillButton } from '../../../../components';
import { useFetch } from '../../../../hooks';

import ConverterJobsTable from './ConverterJobsTable';
import { fetchConverters, startConverter } from '../../../../api/converter';
import { ConvertersData } from './types/converters';

type RunMode = 'start' | 'continue';

export default function ConvertersList({ setIsLoading, onViewJobDetails }) {
  const [orgIdInputs, setOrgIdInputs] = useState<{ [key: string]: string }>({});
  const [dryRunIds, setDryRunIds] = useState<{ [key: string]: boolean }>({});
  const [startMode, setStartMode] = useState<{ [key: string]: RunMode }>({});
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

  useEffect(() => {
    if (convertersData) {
      const initialModes = Object.keys(convertersData.convertersNames).reduce((acc, id) => {
        acc[id] = 'start' as RunMode;
        return acc;
      }, {} as { [key: string]: RunMode });
      setStartMode(initialModes);
    }
  }, [convertersData]);

  const { error: startError, request: startConverterRequest } = useFetch<
    { message: string; converterId: string },
    { error: string }
  >();

  const handleRun = async (
    converterId: string,
    mode: RunMode,
    orgIdInput?: string,
    isDryRun = false
  ) => {
    const organizationId = orgIdInput || null;
    const isContinueMode = mode === 'continue';

    setStartingIds((prev) => new Set(prev).add(converterId));

    try {
      // Depending on mode, you could pass a flag or use different endpoints in the future
      // Fire off startConverter and fetchConverters concurrently
      const startPromise = startConverter(
        startConverterRequest,
        converterId,
        organizationId,
        isContinueMode,
        isDryRun
      );
      // Refresh converters list
      await fetchConverters(fetchConvertersRequest);
      await startPromise;
    } catch (error) {
      const message = `Failed to ${mode === 'continue' ? 'continue' : 'start'} converter: ${
        error?.error || error?.message || 'Unknown error'
      }`;
      setErrorMessage(message);
    } finally {
      setTimeout(() => {
        setStartingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(converterId); // Remove the converter from startingIds after completion
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
                          onChange={(e) => {
                            const newOrgId = e.target.value;
                            setOrgIdInputs((prev) => ({
                              ...prev,
                              [converterId]: newOrgId,
                            }));

                            if (!newOrgId.trim() && startMode[converterId] === 'continue') {
                              setStartMode((prev) => ({
                                ...prev,
                                [converterId]: 'start',
                              }));
                            }
                          }}
                          inputProps={{ 'data-testid': `org-id-${converterId}` }}
                          size="small"
                        />
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={startMode[converterId] || 'start'}
                            onChange={(e) =>
                              setStartMode((prev) => ({
                                ...prev,
                                [converterId]: e.target.value as RunMode,
                              }))
                            }
                            displayEmpty
                          >
                            <MenuItem value="start">Full run</MenuItem>
                            <MenuItem value="continue" disabled={!orgIdInputs[converterId]?.trim()}>
                              Continue from Org ID
                            </MenuItem>
                          </Select>
                        </FormControl>

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={dryRunIds[converterId] || false}
                              onChange={(e) =>
                                setDryRunIds((prev) => ({
                                  ...prev,
                                  [converterId]: e.target.checked,
                                }))
                              }
                              size="small"
                            />
                          }
                          label="Dry run"
                        />

                        <PillButton
                          variant="contained"
                          size="small"
                          disabled={startingIds.has(converterId)}
                          onClick={() =>
                            handleRun(
                              converterId,
                              startMode[converterId] ?? 'start',
                              orgIdInputs[converterId],
                              dryRunIds[converterId] || false
                            )
                          }
                        >
                          {startingIds.has(converterId) ? 'Running...' : 'Run'}
                        </PillButton>
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
