import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const AreaSelectionHelpInformation = ({ measurementUnit }) => (
  <Card sx={{ background: '#e3eff5' }}>
    <CardContent>
      <Typography variant="h6" component="div">
        <LightbulbIcon style={{ color: '#6da8c9' }} /> Help
      </Typography>
      {measurementUnit === 'kilometers' ? (
        <>
          <p>Suggested radius</p>
          <ul>
            <li>50km for palm oil mills</li>
            <li>30km for soy silos</li>
            <li>0.5-18km for cocoa warehouses</li>
          </ul>
        </>
      ) : (
        <>
          <p>Suggested areas</p>
          <ul>
            <li>785,000 ha for palm oil mills</li>
            <li>283,000 ha for soy silos</li>
            <li>80-102,000 ha for cocoa warehouses</li>
          </ul>
        </>
      )}
    </CardContent>
  </Card>
);

export default AreaSelectionHelpInformation;
