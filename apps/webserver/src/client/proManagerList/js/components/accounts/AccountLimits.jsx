import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import GfwButton from '../../../../common/js/components/GfwButton';
import { accountLimitsStrings } from '../../../../common/js/config';
import SettingSection from '../../../../common/js/components/SettingSection';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import { styled } from '@mui/material/styles';
import DialogProvider, { useDialog } from '../../../../common/js/components/Dialog';

const fontStyles = {
  fontFamily: 'Fira Sans, sans-serif',
  textTransform: 'uppercase',
  color: '#555555',
  fontWeight: 500,
};

const FieldLabel = styled(InputLabel)({
  fontFamily: 'Fira Sans, sans-serif',
  textTransform: 'uppercase',
  color: '#555555',
  fontWeight: 500,
  lineHeight: '1.2',
  fontSize: '14px',
  marginBottom: '5px',
});

/**
 * Manage accounts limits based on subscriptions
 * @param {boolean} isLoading
 * @param {function} setIsLoading
 */
function AccountLimits({ isLoading, setIsLoading }) {
  const dialog = useDialog();
  const [accountLimitsData, setAccountLimitsData] = useState({
    standard_area_per_list: 0,
    standard_area_per_year: 0,
    premium_area_list: 0,
    premium_area_per_year: 0,
  });

  const onChangeUpdateField = (field, values) => {
    setAccountLimitsData((prevData) => ({
      ...prevData,
      [field]: values,
    }));
  };

  const back = () => {
    window.location.href = '/pro-manager-list';
  };

  const updateAccountLimits = (payload) => {
    fetch('/analytics/accountLimits', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          dialog.setDialogTitle('Account Limits Updated');
          dialog.disableDialogAction(false);
        }
      })
      .catch(() => {
        dialog.setDialogTitle('Oops! Something went wrong');
        dialog.setDialogMessage('Please try again.');
        dialog.disableDialogAction(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    fetch('/analytics/accountLimits', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(([data]) => {
        setAccountLimitsData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
        <Typography sx={fontStyles} variant="h6">
          {accountLimitsStrings.pageHeading}
        </Typography>
        <GfwButton classNames="btn-green" onClick={back} value="Back to Profile Manager" />
      </Grid>
      <SettingSection subHeading={accountLimitsStrings.stantardSubscriptionSection}>
        <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2}>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={accountLimitsStrings.areaPerList}>
                {accountLimitsStrings.areaPerList}
              </FieldLabel>
              <TextField
                name="standard_area_per_list"
                id="standard_area_per_list"
                onChange={(e) => onChangeUpdateField('standard_area_per_list', e.target.value)}
                value={accountLimitsData.standard_area_per_list}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={accountLimitsStrings.areaPerYear}>
                {accountLimitsStrings.areaPerYear}
              </FieldLabel>
              <TextField
                name="standard_area_per_year"
                id="standard_area_per_year"
                onChange={(e) => onChangeUpdateField('standard_area_per_year', e.target.value)}
                value={accountLimitsData.standard_area_per_year}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Grid>
      </SettingSection>
      <SettingSection subHeading={accountLimitsStrings.premiumSubscriptionSection} hiddenDivider>
        <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2}>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={accountLimitsStrings.areaPerList}>
                {accountLimitsStrings.areaPerList}
              </FieldLabel>
              <TextField
                name="premium_area_list"
                id="premium_area_list"
                onChange={(e) => onChangeUpdateField('premium_area_list', e.target.value)}
                value={accountLimitsData.premium_area_list}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={accountLimitsStrings.areaPerYear}>
                {accountLimitsStrings.areaPerYear}
              </FieldLabel>
              <TextField
                name="premium_area_per_year"
                id="premium_area_per_year"
                onChange={(e) => onChangeUpdateField('premium_area_per_year', e.target.value)}
                value={accountLimitsData.premium_area_per_year}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid item sm={6} xs={12}>
            <GfwButton
              classNames={`btn-green`}
              onClick={() => updateAccountLimits(accountLimitsData)}
              value="Update Limits"
            />
          </Grid>
        </Grid>
      </SettingSection>
    </>
  );
}

export default (props) => (
  <DialogProvider>
    <AccountLimits {...props} />
  </DialogProvider>
);
