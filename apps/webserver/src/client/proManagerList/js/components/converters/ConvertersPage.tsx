import { Grid, Typography } from '@mui/material';

import ConvertersList from './ConvertersList';
import { ConvertersProvider } from './context/ConvertersContext';
import { headingFontStyles } from '../../common/typography';

export default function ConvertersPage({ isLoading = false, setIsLoading }) {
  const converterProps = { isLoading, setIsLoading };

  return (
    <ConvertersProvider {...converterProps}>
      <>
        <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
          <Typography sx={headingFontStyles} variant="h2">
            Converters
          </Typography>
        </Grid>
        <ConvertersList />
      </>
    </ConvertersProvider>
  );
}
