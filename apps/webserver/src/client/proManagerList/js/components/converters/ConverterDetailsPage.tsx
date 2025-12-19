import { useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import errorLogger from '../../../../common/js/utils/errorLogger';
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

import { fetchConverterInfo } from '../../../../api/converter';
import { useFetch } from '../../../../hooks';
import { StyledTableCell } from '../../common/styledTableCell';
import { LoadingModal } from '../../../../components';
import { ConverterJob } from '../../../../types/converters';
import { STATUS_STYLE_MAP } from './constants';

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
      errorLogger.warn('Invalid or missing ID in URL', {
        component: 'ConverterDetailsPage',
        action: 'useEffect',
        idParam,
      });
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
        <LabelRow label="Start Time:">{formatDate(converterJob?.startTime)}</LabelRow>
        <LabelRow label="Finish Time:">
          {converterJob?.finishTime ? formatDate(converterJob.finishTime) : '—'}
        </LabelRow>
        <LabelRow label="Run Mode:">
          <Chip label={converterJob?.mode || '—'} variant="outlined" size="small" />
        </LabelRow>
        <LabelRow label="Organization ID:">
          <Chip label={converterJob?.organizationId ?? '—'} variant="outlined" size="small" />
        </LabelRow>
        <LabelRow label="Total Lists Swept:">
          <Chip label={converterJob?.totalListsAffected ?? '—'} variant="outlined" size="small" />
        </LabelRow>
        <LabelRow label="Dry Run:">
          {converterJob?.isDryRun ? (
            <Chip label="Dry Run" color="primary" variant="outlined" size="small" />
          ) : (
            <Chip label="Live Run" color="secondary" variant="outlined" size="small" />
          )}
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
                    <TableCell size="small">{converterJob?.name}</TableCell>
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
                    <TableCell size="small">{job.listId}</TableCell>
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
      <Box sx={{ fontWeight: 500, paddingRight: '5px', display: 'inline' }}>{label}</Box>
      {children}
    </Typography>
  </Stack>
);

const formatDate = (date) => {
  const dateObj = new Date(date);

  return dateObj.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
