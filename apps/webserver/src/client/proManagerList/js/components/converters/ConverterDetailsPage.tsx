import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  Typography,
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
  name: string;
  organizationId: number | null;
  parentId: number | null;
  listId: number | null;
  children: any[];
}

export default function ConverterDetailsPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const idParam = params.get('id');
  const idAsNumber = idParam ? Number(idParam) : NaN;

  const [jobId, setJobId] = useState<number | null>(null);
  const { data: converterJobInfo, error, isLoading, request } = useFetch<ConverterJobInfo>();

  useEffect(() => {
    if (!isNaN(idAsNumber)) {
      setJobId(idAsNumber);
      fetchConverterInfo(request, idAsNumber);
    } else {
      console.warn('Invalid or missing ID in URL:', idParam);
    }
  }, [idAsNumber, request, idParam]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Could not load converter details</div>;
  }
  if (!jobId) {
    return <div>No converter ID specified.</div>;
  }

  return (
    <Grid container>
      <Box marginBottom={4}>
        <Typography variant="h4">Converter Details</Typography>
        <Stack direction="row" spacing={3} marginTop={2}>
          {converterJobInfo?.status && (
            <Chip
              label={converterJobInfo.status}
              color={STATUS_STYLE_MAP[converterJobInfo.status]}
              variant="filled"
            />
          )}
          <Stack direction="row" spacing={0.5}>
            <Typography paddingTop="3px">
              <b>Type: </b>
              {converterJobInfo?.name}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Typography paddingTop="3px">
              <b>ID: </b>
            </Typography>
            <Chip label={jobId} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Typography paddingTop="3px">
              <b>Start Time: </b>
              {moment(converterJobInfo?.startTime).format('MMMM D, YYYY h:mm A')}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <Grid container direction="column">
        <Typography variant="h6">Failed Child Conversion Jobs</Typography>
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
                    colSpan={6}
                    align="center"
                    sx={{ py: 4, fontStyle: 'italic', color: 'gray' }}
                  >
                    No conversions present errors.
                  </TableCell>
                </TableRow>
              ) : (
                converterJobInfo.children.map((job) => (
                  <TableRow key={job.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell size="small">{job.id}</TableCell>
                    <TableCell size="small">{job.name}</TableCell>
                    <TableCell size="small">
                      {job.status && (
                        <Chip
                          label={job.status}
                          color={STATUS_STYLE_MAP[job.status]}
                          variant="filled"
                        />
                      )}
                    </TableCell>
                    <TableCell size="small">{job.errorDetails}</TableCell>
                    <TableCell size="small">{job.organizationId}</TableCell>
                    <TableCell size="small">{job.tableId}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}
