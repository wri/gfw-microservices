import React from 'react';
import { FeatureProperties } from '../types';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { LabelNameTable } from '../utils/upload';
import { theme } from '../../../../../styles/theme';
import { PillButton } from '../../../../../components';
import { ArrowBackIos, ArrowForwardIos, Replay } from '@mui/icons-material';
import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { NavBar } from '../components';

const getProperty = <T extends object>(obj: T, key: keyof T) => {
  return obj[key];
};

export function UploadLocationPreview() {
  const { uploadLocationsList } = useUploadLocation();
  const history = useHistory();

  const columns = Object.keys(LabelNameTable) as (keyof typeof LabelNameTable)[];
  return (
    <Card sx={{ pt: 1, px: 2, pb: 2 }}>
      <NavBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { sm: 'row', xs: 'column' },
          alignItems: 'center',
          gap: 1,
        }}
      >
        <div>
          <Typography variant="subtitle2">List Preview</Typography>
          <Typography
            variant="caption"
            color={theme.palette.text.secondary}
            sx={{ display: 'inline-block', mt: 1.25, mx: 0, mb: 3 }}
          >
            This is a preview of the first 10 rows of data in your location file. Please review to
            ensure that fields and data format look as you expect. If you see any issues, please
            check / correct your file and re-upload.
          </Typography>
        </div>
        <PillButton
          variant="contained"
          color="info"
          startIcon={<Replay />}
          onClick={() => history.goBack()}
          sx={{ minWidth: '200px' }}
        >
          Retry upload
        </PillButton>
      </Box>
      <Box sx={{ marginBottom: '20px', overflowX: 'scroll' }}>
        <Table sx={{ border: '1px solid', fontSize: '12px' }}>
          <TableHead sx={{ background: theme.palette.background.default }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>{LabelNameTable[column]}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadLocationsList?.slice(0, 10).map((location) => (
              <TableRow key={location.properties.Location_N}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {getProperty(location.properties, column as keyof FeatureProperties)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { sm: 'row', xs: 'column' },
          justifyContent: 'end',
          gap: 1,
        }}
      >
        <PillButton
          variant="contained"
          color="info"
          startIcon={<ArrowBackIos />}
          onClick={() => history.goBack()}
        >
          Back
        </PillButton>
        <PillButton variant="contained" startIcon={<ArrowForwardIos />}>
          Next
        </PillButton>
      </Box>
    </Card>
  );
}
