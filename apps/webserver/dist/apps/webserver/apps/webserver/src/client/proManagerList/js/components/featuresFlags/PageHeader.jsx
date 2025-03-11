import React from 'react';
import { featureFlagsStrings } from '../../../../common/js/config';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import GfwButton from '../../../../common/js/components/GfwButton';
import { useFeatureFlagStateContext } from './FeatureFlagStateContext';

const fontStyles = {
  fontFamily: 'Fira Sans, sans-serif',
  fontWeight: 500,
  color: '#555555',
  fontSize: '22px',
};

function PageHeader() {
  const { selectedFeatureFlag, setSelectedFeatureFlag } = useFeatureFlagStateContext();

  const handleBack = () => {
    setSelectedFeatureFlag(null);
  };

  return (
    <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
      <Typography sx={fontStyles} variant="h3">
        {featureFlagsStrings.pageHeading}{' '}
        {selectedFeatureFlag?.flagId ? '/ ' + selectedFeatureFlag?.flagId : ''}
      </Typography>
      {selectedFeatureFlag?.flagId ? (
        <GfwButton classNames="btn-green" onClick={handleBack} value="Back to Profile Manager" />
      ) : null}
    </Grid>
  );
}

export default PageHeader;
