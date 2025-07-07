import {
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

export default function ConverterRunsTable({ convertersData, onViewJobDetails }) {
  const { request: stopConverterRequest } = useFetch<{ message: string }, { error: string }>();

  const handleStop = async (jobId) => {
    // Call the API to stop the converter job
    // This function should be implemented in the parent component or passed down as a prop
    console.log(`Stopping job with ID: ${jobId}`);
    await stopConverter(stopConverterRequest, jobId);
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
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
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
                    cursor: 'pointer',
                  }}
                >
                  <TableCell size="small">{job.id}</TableCell>
                  <TableCell size="small">{job.name}</TableCell>
                  <TableCell size="small">{job.status}</TableCell>
                  <TableCell size="small" sx={{ display: 'flex', gap: '8px' }}>
                    <PillButton
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent row click
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
                          e.stopPropagation(); // prevent row click
                          handleStop(job.id);
                        }}
                      >
                        Stop
                      </PillButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
