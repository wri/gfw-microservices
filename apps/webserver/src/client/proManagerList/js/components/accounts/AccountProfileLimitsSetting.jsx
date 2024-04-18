import React, { Fragment, useState } from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import GfwButton from '../../../../common/js/components/GfwButton';
import { useDialog } from '../../../../common/js/components/Dialog';
import { accountProfileStrings } from '../../../../common/js/config';
import { useAccountDetail } from './AccountDetailSection';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

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
  fontWeight: 400,
  lineHeight: '1.2',
  fontSize: '14px',
  marginBottom: '5px',
});

/**
 * @Summary Displays and Manage Account Profile Limits Form Setting
 * @Note uses AccountDetailContext
 */
export default function AccountProfileLimitsSetting() {
  const dialog = useDialog();
  const { currentAccount, refreshAccountData } = useAccountDetail();
  const { analysis_limits = {}, organization_id: organizationId } = currentAccount;
  const { subscriptionLimits, extraLimits } = analysis_limits || {};
  const isEditingDisabled =
    currentAccount.organization_status_id !== ACCOUNT_ORG_STATUSES['PENDING'];

  const [accountLimitsFormData, setAccountLimitsFormData] = useState({
    max_locations_per_year: 0,
    MaxAreaAnalyzeablePerYear: 0,
    organizationId,
  });
  const onChangeUpdateField = (field, values) => {
    setAccountLimitsFormData((prevData) => ({
      ...prevData,
      [field]: values,
    }));
  };
  const validateLimitsFormData = (data) => {
    let errors = [];

    if (!data.max_locations_per_year) {
      errors.push('The field "Max Locations Per Year" cannot be empty');
    }
    if (!data.MaxAreaAnalyzeablePerYear) {
      errors.push('The field "Area Per Year" cannot be empty');
    }

    return {
      isFormDataValid: () => errors.length === 0,
      errors,
    };
  };

  const updateAccountProfileLimits = (payload) => {
    const { isFormDataValid, errors } = validateLimitsFormData(payload);
    dialog.openDialog('Updating Account', 'Please wait...', true);

    if (isFormDataValid()) {
      fetch('/pro-manager/updateAccountAnalysisLimits', {
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
            dialog.setDialogTitle('Account Limits Saved');
            dialog.setDialogMessage('Organization custom limits set successfully');
            refreshAccountData();
          }
        });
      return void 0;
    }
    // get back to the user with error messages
    let dialogTitle;
    let dialogMessage;
    if (errors.length > 0) {
      dialogTitle = 'Invalid field entries';
      dialogMessage = ['Please review for empty fields: ', ...errors];
    }
    dialog.setDialogTitle(dialogTitle);
    dialog.setDialogMessage(dialogMessage);
  };

  const formatInputValue = (value) => {
    if(value){
      return parseInt(value).toLocaleString()
    }
  
    return 0;
  }

  return (
    <Fragment>
      {/* Subscription Limits */}
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={12} xs={12}>
          <Typography sx={fontStyles} variant="body1">
            {`${subscriptionLimits?.subscription_name ?? ''} ${
              accountProfileStrings.accountLimitsSetting.subHeadingSubscriptionLimits
            }`}
          </Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.locationsPerYear}>
              {accountProfileStrings.accountLimitsSetting.locationsPerYear}
            </FieldLabel>
            <TextField
              value={formatInputValue(subscriptionLimits?.max_locations_per_year)}
              disabled={true}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.areaPerYear}>
              {accountProfileStrings.accountLimitsSetting.areaPerYear}
            </FieldLabel>
            <TextField
              value={formatInputValue(subscriptionLimits?.MaxAreaAnalyzeablePerYear)}
              disabled={true}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Purchased/Extended Limits */}
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={12} xs={12}>
          <Typography sx={fontStyles} variant="body1">
            {accountProfileStrings.accountLimitsSetting.subHeadingCustomLimits}
          </Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.locationsPerYear}>
              {accountProfileStrings.accountLimitsSetting.locationsPerYear}
            </FieldLabel>
            <TextField
              value={formatInputValue(extraLimits?.max_locations_per_year)}
              disabled={true}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.areaPerYear}>
              {accountProfileStrings.accountLimitsSetting.areaPerYear}
            </FieldLabel>
            <TextField
              value={formatInputValue(extraLimits?.MaxAreaAnalyzeablePerYear)}
              disabled={true}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid sx={{ marginBottom: '16px' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={12} xs={12}>
          <Divider />
        </Grid>
      </Grid>

      {/* Add Extra Limits Form */}
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={12} xs={12}>
          <Typography sx={fontStyles} variant="body1">
            {accountProfileStrings.accountLimitsSetting.subHeadingToAddExtraLimits}
          </Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.locationsPerYear}>
              {accountProfileStrings.accountLimitsSetting.locationsPerYear}
            </FieldLabel>
            <TextField
              name="max_locations_per_year"
              id="max_locations_per_year"
              onChange={(e) => onChangeUpdateField('max_locations_per_year', e.target.value)}
              value={accountLimitsFormData.max_locations_per_year}
              disabled={!isEditingDisabled}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.areaPerYear}>
              {accountProfileStrings.accountLimitsSetting.areaPerYear}
            </FieldLabel>
            <TextField
              name="MaxAreaAnalyzeablePerYear"
              id="MaxAreaAnalyzeablePerYear"
              onChange={(e) => onChangeUpdateField('MaxAreaAnalyzeablePerYear', e.target.value)}
              value={accountLimitsFormData.MaxAreaAnalyzeablePerYear}
              disabled={!isEditingDisabled}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <GfwButton
            classNames={`btn-green ${!isEditingDisabled ? 'button-disabled' : ''}`}
            disabled={!isEditingDisabled}
            onClick={() => updateAccountProfileLimits(accountLimitsFormData)}
            value={`Add Limits`}
          />
        </Grid>
      </Grid>
    </Fragment>
  );
}
