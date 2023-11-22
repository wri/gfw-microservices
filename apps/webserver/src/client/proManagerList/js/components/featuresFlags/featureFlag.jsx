import React, { useEffect, useState } from 'react';
import { getFeatureFlag } from './featureFlags.utils';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import { updateFeatureFlag } from './featureFlags.utils';
import AddCompany from './addCompany';

function FeatureFlag({ fladID, handleBack }) {
  const [flag, setflag] = useState({});

  useEffect(() => {
    getFeatureFlag(fladID).then((data) => {
      setflag(data);
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
        <Grid
          container
          style={{ padding: '20px 0', boxShadow: '0px 1px 0px 0px rgba(0, 0, 0, 0.13) inset' }}
        >
          <Grid item xs={6}>
            <label>FEATURE DETAILS</label>
          </Grid>
          <Grid item xs={6}>
            <label>name</label>
            <div style={{ marginTop: '20px' }}>{flag.flagId}</div>
          </Grid>
        </Grid>
        <Grid
          container
          style={{ padding: '20px 0', boxShadow: '0px 1px 0px 0px rgba(0, 0, 0, 0.13) inset' }}
        >
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
        <Grid
          container
          style={{ padding: '20px 0', boxShadow: '0px 1px 0px 0px rgba(0, 0, 0, 0.13) inset' }}
        >
          <Grid item xs={6}>
            <label>ACCOUNT</label>
          </Grid>
          <Grid item xs={6}>
            <AddCompany flagName={flag.flagId} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default FeatureFlag;
