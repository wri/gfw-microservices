import { useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
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
import { LoadingModal } from '../../../../components';
import { ConverterJob } from './types/converters';

const STATUS_STYLE_MAP = {
  STOPPED: 'warning',
  PENDING: 'primary',
  COMPLETED: 'success',
  RUNNING: 'primary',
  PARTIAL: 'warning',
  FAILED: 'error',
};

export default function ConverterDetailsPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const idParam = params.get('id');
  const idAsNumber = idParam ? Number(idParam) : NaN;

  const [jobId, setJobId] = useState<number | null>(null);
  const { data: converterJob, error, isLoading, request } = useFetch<ConverterJob>();

  useEffect(() => {
    if (!isNaN(idAsNumber)) {
      setJobId(idAsNumber);
      fetchConverterInfo(request, idAsNumber);
    } else {
      console.warn('Invalid or missing ID in URL:', idParam);
    }
  }, [idAsNumber, request, idParam]);

  if (isLoading) {
    return <LoadingModal isLoading={isLoading} />;
  }
  if (error) {
    return <div>Could not load converter details</div>;
  }
  if (!jobId) {
    return <div>No converter ID specified.</div>;
  }

  return (
    <Grid container>
      <Typography variant="h4">Converter Details</Typography>
      <Grid container sx={{ display: 'flex', flexDirection: 'row', gap: 3, mt: 2 }}>
        {converterJob?.status && (
          <Chip
            label={converterJob.status}
            color={STATUS_STYLE_MAP[converterJob.status]}
            variant="filled"
          />
        )}
        <LabelRow label="Type:">{converterJob?.name}</LabelRow>
        <LabelRow label="ID:">
          <Chip label={jobId} variant="outlined" />
        </LabelRow>
        <LabelRow label="Start Time:">
          {moment(converterJob?.startTime).format('MMMM D, YYYY h:mm A')}
        </LabelRow>
      </Grid>
      <Grid container direction="column" sx={{ mt: '25px' }}>
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
              {!converterJob?.children.length ? (
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
                converterJob.children.map((job) => (
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

const LabelRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack sx={{ flexDirection: 'row', gap: '4px', alignContent: 'center' }}>
    <Typography sx={{ paddingTop: '3px' }}>
      <b>{label} </b>
      {children}
    </Typography>
  </Stack>
);
