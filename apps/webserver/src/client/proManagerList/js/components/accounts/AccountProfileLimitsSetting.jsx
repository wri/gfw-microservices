import React from 'react';
import { Fragment, useState, useEffect } from 'react';
import Select from 'react-select';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import SelectField from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import GfwButton from '../../../../common/js/components/GfwButton';
import { profilePage } from '../../../../common/js/config';
import { fieldValidations } from '../../../../profile/js/utils/validations';
import { useDialog } from '../../../../common/js/components/Dialog';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import { accountProfileStrings } from '../../../../common/js/config';

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
 * Displays and Manage Account Profile Limits Form Setting
 * @param {Object} accountLimitsData,
 * @param {Boolean} isAccountStatusNotPending
 * @param {Number} organizationId required
 * @param {Number} organizationType required
 */
export default function AccountProfileLimitsSetting({
  accountLimitsData,
  isAccountStatusNotPending: isEditingDisabled,
  organizationId,
  organizationType,
}) {
  const dialog = useDialog();
  const [accountLimitsFormData, setAccountLimitsFormData] = useState({
    account_limits_per_list: accountLimitsData.account_limits_per_list,
    account_limits_per_year: accountLimitsData.account_limits_per_year,
  });

  const onChangeUpdateField = (field, values) => {
    setAccountLimitsFormData((prevData) => ({
      ...prevData,
      [field]: values,
    }));
  };
//   analyticsRouter.get('/limit', controller.getOrganizationAnalysisLimit);
// orgId and/or orgType=subscription_status_id
  const updateAccountProfileLimits = (payload) => {
    // 
  }

  return (
    <Fragment>
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.areaPerList}>
              {accountProfileStrings.accountLimitsSetting.areaPerList}
            </FieldLabel>
            <TextField
              name="account_limits_per_list"
              id="account_limits_per_list"
              onChange={(e) => onChangeUpdateField('account_limits_per_list', e.target.value)}
              value={accountLimitsFormData.account_limits_per_list}
              disabled={isEditingDisabled}
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
              name="account_limits_per_year"
              id="account_limits_per_year"
              onChange={(e) => onChangeUpdateField('account_limits_per_year', e.target.value)}
              value={accountLimitsFormData.account_limits_per_year}
              disabled={isEditingDisabled}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <GfwButton
            classNames={`btn-green ${isEditingDisabled ? 'button-disabled' : ''}`}
            disabled={isEditingDisabled}
            onClick={() => updateAccountProfileLimits(accountLimitsFormData)}
            value="Update Limits"
          />
        </Grid>
      </Grid>
    </Fragment>
  );
}