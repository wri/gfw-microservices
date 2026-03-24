import { Fragment, useState } from 'react';
import { Grid, TextField, Typography, Divider } from '@mui/material';
import featureFlags from '../../../../../utils/general.utils';

import { useDialog } from '../../../../common/js/components/Dialog';
import { accountProfileStrings } from '../../../../common/js/config';
import { useAccountDetail } from './AccountDetailSection';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import { PillButton } from '../../../../components';
import FieldLabel from './FieldLabel';

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
  const isProManager = window.location.pathname.startsWith('/pro-manager');
  const { isTokenizationAvailable } = featureFlags;

  const locationsLabel =
    isProManager || isTokenizationAvailable
      ? accountProfileStrings.accountLimitsSetting.tokensPerYear
      : accountProfileStrings.accountLimitsSetting.locationsPerYear;

  const [accountLimitsFormData, setAccountLimitsFormData] = useState({
    tokens_per_year: 0,
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

    if (!data.tokens_per_year) {
      errors.push('The field "Tokens Per Year" cannot be empty');
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
    if (value) {
      return parseInt(value).toLocaleString();
    }

    return 0;
  };

  return (
    <Fragment>
      {/* Subscription Limits */}
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={12} xs={12}>
          <Typography variant="body1">
            {`${subscriptionLimits?.subscription_name ?? ''} ${
              accountProfileStrings.accountLimitsSetting.subHeadingSubscriptionLimits
            }`}
          </Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={locationsLabel}>{locationsLabel}</FieldLabel>
            <TextField
              value={formatInputValue(subscriptionLimits?.tokens_per_year)}
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
          <Typography variant="body1">
            {accountProfileStrings.accountLimitsSetting.subHeadingCustomLimits}
          </Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={locationsLabel}>{locationsLabel}</FieldLabel>
            <TextField
              value={formatInputValue(extraLimits?.tokens_per_year)}
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
          <Typography variant="body1">
            {accountProfileStrings.accountLimitsSetting.subHeadingToAddExtraLimits}
          </Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={locationsLabel}>{locationsLabel}</FieldLabel>
            <TextField
              name="tokens_per_year"
              id="tokens_per_year"
              onChange={(e) => onChangeUpdateField('tokens_per_year', e.target.value)}
              value={accountLimitsFormData.tokens_per_year}
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
          <PillButton
            variant="contained"
            size="small"
            disabled={!isEditingDisabled}
            onClick={() => updateAccountProfileLimits(accountLimitsFormData)}
            sx={{ marginBottom: 1 }}
          >
            Add Limits
          </PillButton>
          {(isProManager || isTokenizationAvailable) && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Updating the limits will affect all organizations at time of account renewal. Limits
              are visible to both internal and external users.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Fragment>
  );
}
