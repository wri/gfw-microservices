import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  Typography,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import moment from 'moment';

import { fetchConverterInfo } from '../../../../api/converter';
import { useFetch } from '../../../../hooks';
import { StyledTableCell } from '../../common/styledTableCell';

const STATUS_STYLE_MAP = {
  STOPPED: 'warning',
  COMPLETE: 'success',
  PARTIAL: 'warning',
  PENDING: 'primary',
};

interface ConverterJobInfo {
  startTime: Date;
  status: string;
  id: number;
  organizationId: number | null;
  parentId: number | null;
  listId: number | null;
  children: any[];
}

export default function ConverterDetailsPage() {
  const [jobId, setJobId] = useState<number>();
  const { data: converterJobInfo, error, isLoading, request } = useFetch<ConverterJobInfo>();

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const idSegment = pathParts[pathParts.length - 1]; // assumes ID is last
    const idAsNumber = Number(idSegment);

    if (!isNaN(idAsNumber)) {
      setJobId(idAsNumber);
      fetchConverterInfo(request, idAsNumber); // your data fetch
    } else {
      console.warn('Invalid ID in URL:', idSegment);
    }
  }, []);

  useEffect(() => {
    console.log('converterJobInfo: ', converterJobInfo);
  }, [converterJobInfo]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Could not load converter details</div>;
  }

  return (
    <Grid>
      <Box>
        <Typography variant="h4">Converter Details</Typography>
        <Stack direction="row" spacing={1} marginTop={2}>
          <Chip label={`ID: ${jobId}`} variant="outlined" />
          <Chip
            label={`Start Time: ${moment(converterJobInfo?.startTime).format(
              'MMMM D, YYYY h:mm A'
            )}`}
            variant="outlined"
          />
          {converterJobInfo?.status && (
            <Chip
              label={converterJobInfo?.status}
              color={STATUS_STYLE_MAP[converterJobInfo?.status]}
              variant="filled"
            />
          )}
        </Stack>
      </Box>
      <Divider>Failed Child Conversion Jobs</Divider>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Error Details</StyledTableCell>
              <StyledTableCell>Organization ID</StyledTableCell>
              <StyledTableCell>Table ID</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!converterJobInfo?.children.length ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4, fontStyle: 'italic', color: 'gray' }}
                >
                  No conversions present errors.
                </TableCell>
              </TableRow>
            ) : (
              converterJobInfo?.children.map((job) => (
                <TableRow key={job.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <StyledTableCell>{job.id}</StyledTableCell>
                  <StyledTableCell>{job.name}</StyledTableCell>
                  <StyledTableCell>
                    {job.status && (
                      <Chip
                        label={job.status}
                        color={STATUS_STYLE_MAP[job.status]}
                        variant="filled"
                      />
                    )}
                  </StyledTableCell>
                  <StyledTableCell>{job.errorDetails}</StyledTableCell>
                  <StyledTableCell>{job.organizationId}</StyledTableCell>
                  <StyledTableCell>{job.tableId}</StyledTableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}
