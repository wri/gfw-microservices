import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { locationsPage } from '../../../../common/js/config';

const AreaSelectionHelpInformation = ({ measurementUnit }) => {
  const { add } = locationsPage;
  const {
    help,
    suggestedRadii,
    fiftyKmPalm,
    thirtyKmSoy,
    dash18KmCocoa,
    suggestedAreas,
    haPalm,
    haSoy,
    haCocoa,
  } = add;

  return (
    <Card sx={{ background: '#e3eff5' }}>
      <CardContent>
        <Typography variant="h6" component="div">
          <LightbulbIcon style={{ color: '#6da8c9' }} /> {help}
        </Typography>
        {measurementUnit === 'kilometers' ? (
          <>
            <p>{suggestedRadii}</p>
            <ul>
              <li>{fiftyKmPalm}</li>
              <li>{thirtyKmSoy}</li>
              <li>{dash18KmCocoa}</li>
            </ul>
          </>
        ) : (
          <>
            <p>{suggestedAreas}</p>
            <ul>
              <li>{haPalm}</li>
              <li>{haSoy}</li>
              <li>{haCocoa}</li>
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AreaSelectionHelpInformation;
