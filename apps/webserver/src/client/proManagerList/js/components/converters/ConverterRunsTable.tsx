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

export default function ConverterRunsTable({ convertersData, onViewJobDetails }) {
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
                  <TableCell size="small">{convertersData.convertersNames[job.name]}</TableCell>
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
