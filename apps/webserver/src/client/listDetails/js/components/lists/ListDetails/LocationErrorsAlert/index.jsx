import { Alert, AlertTitle, Typography, Link } from '@mui/material';
import { PillButton } from '../../../../../../components';
import { ExternalLinks } from '../../../../../../utils/constants';

const LocationErrorsAlert = ({ locationsWithError, onAddLocationsAgain }) => {
  if (!locationsWithError?.length) {
    return null;
  }

  return (
    <Alert
      variant="filled"
      severity="error"
      sx={{
        backgroundColor: (theme) => theme.palette.error[100],
        color: (theme) => theme.palette.error[700],
      }}
      action={
        <PillButton
          variant="contained"
          color="info"
          sx={{ width: '240px', alignSelf: 'center' }}
          onClick={onAddLocationsAgain}
        >
          Add Locations again
        </PillButton>
      }
    >
      <AlertTitle>Location Errors</AlertTitle>
      <Typography variant="body2">
        <strong>
          {locationsWithError.length} {locationsWithError.length > 1 ? 'locations' : 'location'}
        </strong>{' '}
        couldn't be analyzed due to invalid data (based on the first 50 rows in your list). Hover
        over each failed location in the table to view specific errors. Fix errors offline, re-add
        locations to your list, and resubmit for analysis. You can delete previously failed
        locations if desired.{' '}
        <Link
          href={ExternalLinks.UploadListHelpCenter}
          target="_blank"
          sx={{ color: (theme) => theme.palette.error[700], textDecoration: 'underline' }}
        >
          More details
        </Link>
      </Typography>
    </Alert>
  );
};

export default LocationErrorsAlert;
