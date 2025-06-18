import { Grid, Typography } from '@mui/material';

import { PillButton } from '../../../../components';
import ConvertersList from './ConvertersList';
import { ConvertersProvider } from './context/ConvertersContext';
import { headingFontStyles } from '../../common/typography';

export default function ConvertersPage({ isLoading = false, setIsLoading }) {
  return (
    <ConvertersProvider isLoading={isLoading} setIsLoading={setIsLoading}>
      <>
        <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
          <Typography sx={headingFontStyles} variant="h2">
            Converters
          </Typography>
          <PillButton variant="contained" size="small" href="/pro-manager-list">
            Back to Profile Manager
          </PillButton>
        </Grid>
        <ConvertersList />
      </>
    </ConvertersProvider>
  );
}
