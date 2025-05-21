import { Grid, Typography } from '@mui/material';

import { PillButton } from '../../../../components';
import { featureFlagsStrings } from '../../../../common/js/config';
import { useFeatureFlagStateContext } from './FeatureFlagStateContext';

function PageHeader() {
  const { selectedFeatureFlag, setSelectedFeatureFlag } = useFeatureFlagStateContext();

  const handleBack = () => {
    setSelectedFeatureFlag(null);
  };

  return (
    <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
      <Typography variant="h5">
        {featureFlagsStrings.pageHeading}{' '}
        {selectedFeatureFlag?.flagId ? '/ ' + selectedFeatureFlag?.flagId : ''}
      </Typography>
      {selectedFeatureFlag?.flagId ? (
        <PillButton variant="contained" size="small" onClick={handleBack}>
          Back to profile manager
        </PillButton>
      ) : null}
    </Grid>
  );
}

export default PageHeader;
