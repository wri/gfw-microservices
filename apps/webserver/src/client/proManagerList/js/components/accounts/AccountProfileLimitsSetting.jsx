import { Fragment, useState } from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import GfwButton from '../../../../common/js/components/GfwButton';
import { useDialog } from '../../../../common/js/components/Dialog';
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
 * WIP
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
}) {
  const dialog = useDialog();
  const [accountLimitsFormData, setAccountLimitsFormData] = useState({
    MaxAreaPerList: accountLimitsData.MaxAreaPerList,
    MaxAreaAnalyzeablePerYear: accountLimitsData.MaxAreaAnalyzeablePerYear,
    organizationId,
  });
  const onChangeUpdateField = (field, values) => {
    setAccountLimitsFormData((prevData) => ({
      ...prevData,
      [field]: values,
    }));
  };
  const getButtonLabel = () => {
    return accountLimitsData.OrgID === null ? 'Set Custom Limits' : 'Update Limits';
  };
  const validateLimitsFormData = (data) => {
    let errors = [];

    if (!data.MaxAreaPerList) {
      errors.push('The field "Area Per List" cannot be empty');
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
            setTimeout(() => window.location.reload(), 700);
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

  return (
    <Fragment>
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountLimitsSetting.areaPerList}>
              {accountProfileStrings.accountLimitsSetting.areaPerList}
            </FieldLabel>
            <TextField
              name="MaxAreaPerList"
              id="MaxAreaPerList"
              onChange={(e) => onChangeUpdateField('MaxAreaPerList', e.target.value)}
              value={accountLimitsFormData.MaxAreaPerList}
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
            value={getButtonLabel()}
          />
        </Grid>
      </Grid>
    </Fragment>
  );
}
