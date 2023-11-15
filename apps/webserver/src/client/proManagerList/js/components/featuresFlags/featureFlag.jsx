import React, { useEffect, useState } from 'react';
import { getFeatureFlag } from './featureFlags.utils';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';

function FeatureFlag({ fladID, handleBack }) {
  const [flag, setflag] = useState({});

  useEffect(() => {
    getFeatureFlag(fladID).then((data) => {
      setflag({ flagId: 'B2B Sharing', flagState: true });
    });
  }, []);

  const statusLabel = flag.flagState ? 'Active' : 'Inactive';

  const handleUpdateStatus = (status) => {
    updateFeatureFlag(flag.flagState, status, flag.orgId);
  };

  return (
    <div>
      <h3 style={{ float: 'left' }}>Features / {flag.flagId}</h3>

      <button className="gfw-button btn-green" onClick={handleBack} style={{ float: 'right' }}>
        BACK TO PROFILE MANAGER
      </button>

      <div>
        <Grid container>
          <Grid item xs={6}>
            <label>FEATURE DETAILS</label>
          </Grid>
          <Grid item xs={6}>
            <label>name</label>
            <div>{flag.flagId}</div>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <label>STATUS</label>
          </Grid>
          <Grid item xs={6}>
            {statusLabel}
            <Switch
              checked={flag.flagState}
              color="default"
              onChange={(event) => handleUpdateStatus(event.target.checked)}
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default FeatureFlag;
