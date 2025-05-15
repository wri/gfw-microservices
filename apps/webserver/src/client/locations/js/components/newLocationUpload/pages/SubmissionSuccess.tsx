import { useUploadLocation } from '../contexts';
import { ArrowBack, Home, PendingTwoTone } from '@mui/icons-material';
import { Box, Card, IconButton, Typography } from '@mui/material';
import { PillButton } from '../../../../../components';

export function SubmissionSuccess() {
  const { uploadLocationState, clearUploadType } = useUploadLocation();

  return (
    <>
      <Box
        sx={{
          display: { sm: 'flex', xs: 'block' },
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
        }}
      >
        <IconButton onClick={clearUploadType} disableRipple>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ minWidth: 'fit-content' }}>
          New Location
        </Typography>
      </Box>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '80vh',
        }}
      >
        <PendingTwoTone sx={{ color: '#BAEAFF', width: '5.25rem', height: '5.25rem' }} />
        <Typography variant="subtitle2" sx={{ my: 1, textTransform: 'uppercase' }}>
          {uploadLocationState.isDraft ? 'Your list is saved as draft' : "Now it's up to us!"}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {uploadLocationState.isDraft
            ? 'Your list can be accessed via the Locations page and be submitted for analysis later on.'
            : 'We will review your request and you will be notified within 24 hours.'}
        </Typography>
        <PillButton
          variant="contained"
          color="info"
          sx={{ mt: 3 }}
          startIcon={<Home />}
          onClick={() => (window.location.href = '/locations')}
        >
          Return to locations
        </PillButton>
      </Card>
    </>
  );
}
