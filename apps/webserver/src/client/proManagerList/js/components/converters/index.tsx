import { Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import { PillButton } from '../../../../components';

type ConvertersProps = {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
};

const fontStyles = {
  fontFamily: 'Fira Sans, sans-serif',
  textTransform: 'uppercase',
  color: '#555555',
  fontSize: '28px',
};

function Converters({ isLoading = false, setIsLoading }: ConvertersProps) {
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      {!isLoading && (
        <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
          <Typography sx={fontStyles} variant="h2">
            Converters
          </Typography>
          <PillButton variant="contained" size="small" href="/pro-manager-list">
            Back to Profile Manager
          </PillButton>
        </Grid>
      )}
    </>
  );
}

export default Converters;
