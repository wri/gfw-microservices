import React from 'react';
import { LocationListType, FeatureProperties } from '../types';
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { LabelNameTable } from '../utils/upload';
import { theme } from '../../../../../styles/theme';
import { PillButton } from '../../../../../components';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

type PreviewProps = {
  locationList: LocationListType[];
  backButton: () => void;
};

const getProperty = <T extends object>(obj: T, key: keyof T) => {
  return obj[key];
};

export function UploadLocationPreview({ backButton, locationList }: PreviewProps) {
  const collumns = Object.keys(LabelNameTable) as (keyof typeof LabelNameTable)[];
  return (
    <Card sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant="subtitle2">List Preview</Typography>
      <Typography
        variant="caption"
        color={theme.palette.text.secondary}
        sx={{ display: 'inline-block', mt: 1.25, mx: 0, mb: 3 }}
      >
        This is a preview of the first 20 rows of data in your location file. Please review to ensure that fields and data format look as you expect. If you see any issues, please check / correct your file and re-upload.
      </Typography>
      <Table sx={{ border: '1px solid', fontSize: '12px' }}>
        <TableHead sx={{background: theme.palette.background.default}}>
          <TableRow>
            {collumns.map((column) => (
              <TableCell key={column}>{LabelNameTable[column]}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {locationList.slice(0, 10).map((lotation) => (
            <TableRow key={lotation.properties.Location_N}>
              {collumns.map((column) => (
                <TableCell key={column}>
                  {getProperty(lotation.properties, column as keyof FeatureProperties)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
          onClick={() => backButton()}
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
