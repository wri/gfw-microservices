import { Grid, Typography } from '@mui/material';
import ConvertersList from './ConvertersList';

export default function ConvertersPage({ setIsLoading }) {
  return (
    <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
      <Typography variant="h3">Converters</Typography>
      <ConvertersList setIsLoading={setIsLoading} />
    </Grid>
  );
}
