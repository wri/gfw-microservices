import {
  Alert,
  Box,
  Chip,
  Snackbar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  TableCell,
  Typography,
} from '@mui/material';

import { PillButton } from '../../../../components';
import { StyledTableCell } from '../../common/styledTableCell';
import { stopConverter } from '../../../../api/converter';
import { useFetch } from '../../../../hooks';
import { STATUS_STYLE_MAP } from './constants';
import { useState } from 'react';

export default function ConverterRunsTable({ convertersData, onViewJobDetails, fetchConverters }) {
  const { request: stopConverterRequest } = useFetch<{ message: string }, { error: string }>();
  const [converterStoppedMsg, setConverterStoppedMsg] = useState<string | null>(null);
  const [converterStopError, setConverterStopError] = useState<string | null>(null);

  const handleStop = async (jobId) => {
    try {
      await stopConverter(stopConverterRequest, jobId);
      setConverterStoppedMsg(`Stopped Converter Job ${jobId}`);
    } catch (error) {
      setConverterStopError(error?.error || error?.message || `Failed to stop job ${jobId}`);
    } finally {
      fetchConverters();
    }
  };

  return (
    <>
      <Typography variant="subtitle1" marginTop={3} marginBottom={1}>
        Active or Past Jobs
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Converter ID</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Org. ID</StyledTableCell>
              <StyledTableCell>Run Mode</StyledTableCell>
              <StyledTableCell>Dry Run</StyledTableCell>
              <StyledTableCell>Action(s)</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!convertersData?.converterJobs.length ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4, fontStyle: 'italic', color: 'gray' }}
                >
                  No converter jobs have been run or are currently active.
                </TableCell>
              </TableRow>
            ) : (
              convertersData?.converterJobs.map((job) => (
                <TableRow
                  key={job.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell size="small">{job.id}</TableCell>
                  <TableCell size="small">
                    {convertersData.convertersNames[job.name] || job.name}
                  </TableCell>
                  <TableCell size="small">
                    <Chip
                      label={job.status}
                      color={STATUS_STYLE_MAP[job.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell size="small">
                    {job.organizationId || '—'}
                  </TableCell>
                  <TableCell size="small">{job.mode || '—'}</TableCell>
                  <TableCell size="small">
                    {job.isDryRun === null || job.isDryRun === undefined
                      ? '—'
                      : job.isDryRun
                      ? 'Dry Run'
                      : 'Live Run'}
                  </TableCell>
                  <TableCell size="small">
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                      <PillButton
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewJobDetails(job.id);
                        }}
                      >
                        View
                      </PillButton>
                      {job.status === 'RUNNING' && (
                        <PillButton
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStop(job.id);
                          }}
                        >
                          Stop
                        </PillButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={!!converterStoppedMsg}
        autoHideDuration={4000}
        onClose={() => setConverterStoppedMsg(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setConverterStoppedMsg(null)}
          severity="success"
          sx={{
            backgroundColor: '#EDF7D7',
            border: '1px solid #9FC642',
            width: '100%',
          }}
        >
          {converterStoppedMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!converterStopError}
        autoHideDuration={4000}
        onClose={() => setConverterStopError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setConverterStopError(null)}
          severity="error"
          sx={{
            backgroundColor: '#FFF7F8',
            border: '1px solid #F44336',
            width: '100%',
          }}
        >
          {converterStopError}
        </Alert>
      </Snackbar>
    </>
  );
}
