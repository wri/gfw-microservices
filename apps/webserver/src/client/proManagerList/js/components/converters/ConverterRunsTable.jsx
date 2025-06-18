import { Table, TableHead, TableBody, TableRow, TableContainer, TableCell } from '@mui/material';

import { PillButton } from '../../../../components';
import { StyledTableCell } from '../../common/styledTableCell';

export default function ConverterRunsTable({ converterJobs }) {
  return (
    <TableContainer sx={{ marginTop: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>ID</StyledTableCell>
            <StyledTableCell>Type</StyledTableCell>
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell>Action/s</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {converterJobs.length === 0 ? (
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
            converterJobs.map((job) => (
              <TableRow
                key={job.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                }}
              >
                <StyledTableCell>{job.id}</StyledTableCell>
                <StyledTableCell>{job.type}</StyledTableCell>
                <StyledTableCell>{job.status}</StyledTableCell>
                <StyledTableCell sx={{ display: 'flex', gap: '8px' }}>
                  <PillButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent row click
                      window.location.href = `/converter-jobs/${job.id}`;
                    }}
                  >
                    🔎 View
                  </PillButton>
                </StyledTableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
