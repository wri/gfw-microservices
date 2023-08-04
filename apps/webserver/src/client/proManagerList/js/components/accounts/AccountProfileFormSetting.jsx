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
import { accountProfileStrings, subscriptionStatusOptions } from '../../../../common/js/config';

const FieldLabel = styled(InputLabel)({
  fontFamily: 'Fira Sans, sans-serif',
  textTransform: 'uppercase',
  color: '#555555',
  fontWeight: 500,
  lineHeight: '1.2',
  fontSize: '14px',
  marginBottom: '5px',
});

const disabledStyles = {
  '&.Mui-disabled': {
    backgroundColor: 'rgb(0 0 0 / 4%)',
    cursor: 'not-allowed',
  },
};

/**
 * Displays and Manage Account Profile Form Settings
 * @param {Object} accountData
 * @param {Boolean} isAccountStatusNotPending
 * @param {Array} classificationsData
 * @param {Array} policyList
 */
export default function AccountProfileFormSetting({
  accountData,
  isAccountStatusNotPending: isEditingDisabled,
  classificationsData,
  policyList,
}) {
  const dialog = useDialog();
  const getClassificationsValuesFromArrId = (orgClassificationsArrId) => {
    return orgClassificationsArrId.map((classification) => {
      const classId = parseInt(classification, 10);
      const data = classificationsData.find((c) => c.id === classId);
      return data
        ? { label: data.classification_name, value: classId }
        : { label: '', value: classId };
    });
  };
  const [accountFormData, setAccountFormData] = useState({
    id: accountData.organization_id,
    org_name: accountData.organization_name,
    org_address: accountData.organization_address,
    org_website: accountData.organization_website,
    parent_org_name: accountData.organization_parent,
    is_subsidiary: accountData.organization_is_subsidiary,
    arr_org_classification_ids: accountData.organization_classifications_ids.split(','),
    policyUploadList: [],
    policyNames: [],
    subscription_status_id: accountData.subscription_status_id,
  });
  const [accountClassificationsFieldValue, setAccountClassicationsFieldValue] = useState(
    getClassificationsValuesFromArrId(accountFormData.arr_org_classification_ids)
  );
  const classificationFieldOptions = classificationsData.map(({ classification_name, id }) => ({
    label: classification_name,
    value: id,
  }));
  const [accountPolicySelectedList, setAccountPoliciesFieldValue] = useState([]);
  const policyFieldOptions = policyList
    .filter((policy) => policy.organization_id === accountData.organization_id)
    .map(({ document_name }) => ({
      label: document_name,
      value: document_name,
    }));
  const onChangeUpdateField = (field, values) => {
    setAccountFormData((prevData) => ({
      ...prevData,
      [field]: values,
    }));
  };

  useEffect(() => {
    onChangeUpdateField(
      'arr_org_classification_ids',
      accountClassificationsFieldValue.map((c) => Number(c.value))
    );
  }, [accountClassificationsFieldValue]);

  /**
   * @deprecated
   * @note figure out the state of affairs for policies management
   */
  const downloadPolicies = () => {
    const errors = [];
    let errorTitle;
    if (accountFormData.accountPolicySelectedList.length > 1) {
      errors.push('Too many files. Please select one.');
      errorTitle = 'Multiples files!';
    } else if (accountFormData.accountPolicySelectedList.length === 0) {
      errors.push('No policy files are selected. Please select one.');
      errorTitle = 'No files selected!';
    }

    if (errors.length === 0) {
      window.location.href = `/pro-manager/downloadPolicyPro/${accountFormData.accountPolicySelectedList[0].value}/${accountFormData.organization_id}`;
    } else {
      /**
       * @TODO IMPLEMENT DIALOG SERVICE
       */
    }
  };
  /**
   * @deprecated
   * @note figure out the state of affairs for policies management
   */
  const updatePolicy = (evt) => {
    const policyList = [];
    const policyNameList = [];
    for (const key of Object.keys(evt.target.files)) {
      policyNameList.push(evt.target.files[key].name);
      const reader = new FileReader();
      reader.readAsDataURL(evt.target.files[key]);
      reader.onload = function () {
        policyList.push(reader.result);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
    setAccountFormData((preVFormData) => ({
      ...preVFormData,
      policyUploadList: policyList,
      policyNames: policyNameList,
    }));
  };
  const validateAccountFormData = (data) => {
    let errors = [];
    let missing = [];

    fieldValidations.organization_name.validations.forEach((validation) => {
      if (validation(data.org_name.trim()) === false) {
        errors.push(fieldValidations.organization_name.text);
      }
    });
    fieldValidations.organization_name.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(data.org_name.trim()) === false) {
        missing.push(fieldValidations.organization_name.text);
      }
    });

    if (data.is_subsidiary && data.parent_org_name.trim().length === 0) {
      errors.push('You must provide a parent organization if your organization is a subsidy.');
    }
    if (!data.is_subsidiary && data.parent_org_name.trim().length !== 0) {
      errors.push('You must check the subsidiary box if a parent organization is supplied.');
    }
    fieldValidations.organization_address.validations.forEach((validation) => {
      if (validation(data.org_address.trim()) === false) {
        errors.push(fieldValidations.organization_address.text);
      }
    });
    fieldValidations.organization_address.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(data.org_address.trim()) === false) {
        missing.push(fieldValidations.organization_address.text);
      }
    });
    fieldValidations.organization_website.validations.forEach((validation) => {
      if (validation(data.org_website.trim()) === false) {
        errors.push(fieldValidations.organization_website.text);
      }
    });
    fieldValidations.organization_website.mandatoryChecks.forEach((mandatoryCheck) => {
      if (mandatoryCheck(data.org_website.trim()) === false) {
        missing.push(fieldValidations.organization_website.text);
      }
    });

    return {
      isFormDataValid: () => errors.length === 0 && missing.length === 0,
      errors,
      missing,
    };
  };
  const updateProAccount = (payload) => {
    const { isFormDataValid, errors, missing } = validateAccountFormData(payload);
    dialog.openDialog('Updating Account', 'Please wait...', true);

    if (isFormDataValid()) {
      fetch('/pro-manager/updateProAccount', {
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
            dialog.setDialogTitle('Account Information Saved');
            dialog.setDialogMessage('Organization profile updated successfully');
            setTimeout(() => window.location.reload(), 700);
          }
        })
        .catch(() => {
          dialog.setDialogTitle('Oops! Something went wrong');
          dialog.setDialogMessage('Please try again.');
          dialog.disableDialogAction(false);
        });
      return void 0;
    }
    // get back to the user with error messages
    let dialogTitle;
    let dialogMessage;
    if (errors.length > 0 && missing.length > 0) {
      dialogTitle = 'Invalid field entries & Mandatory fields missing';
      dialogMessage = [
        'Please review for invalid characters: ',
        ...errors,
        'Please enter: ',
        ...missing,
      ];
    } else if (errors.length > 0) {
      dialogTitle = 'Invalid field entries';
      dialogMessage = ['Please review for invalid characters: ', ...errors];
    } else {
      dialogTitle = 'Mandatory fields missing';
      dialogMessage = ['Please enter: ', ...missing];
    }
    dialog.setDialogTitle(dialogTitle);
    dialog.setDialogMessage(dialogMessage);
  };

  return (
    <Fragment>
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel required aria-label={accountProfileStrings.accountFormLabels.org_name}>
              {accountProfileStrings.accountFormLabels.org_name}
            </FieldLabel>
            <TextField
              name="org_name"
              id="org_name"
              onChange={(e) => onChangeUpdateField('org_name', e.target.value)}
              value={accountFormData.org_name}
              disabled={isEditingDisabled}
              required
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel required aria-label={accountProfileStrings.accountFormLabels.org_website}>
              {accountProfileStrings.accountFormLabels.org_website}
            </FieldLabel>
            <TextField
              name="org_website"
              id="org_website"
              onChange={(e) => onChangeUpdateField('org_website', e.target.value)}
              value={accountFormData.org_website}
              disabled={isEditingDisabled}
              required
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item xs>
          <Grid container direction="column">
            <FieldLabel required aria-label={accountProfileStrings.accountFormLabels.org_address}>
              {accountProfileStrings.accountFormLabels.org_address}
            </FieldLabel>
            <TextField
              name="org_address"
              id="org_address"
              onChange={(e) => onChangeUpdateField('org_address', e.target.value)}
              value={accountFormData.org_address}
              disabled={isEditingDisabled}
              required
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12} alignSelf="center">
          <Grid container>
            <FormControlLabel
              label={
                <FieldLabel
                  htmlFor="is_subsidiary"
                  disabled={isEditingDisabled}
                  aria-label={accountProfileStrings.accountFormLabels.is_subsidiary}
                  sx={{ marginBottom: 0 }}
                >
                  {accountProfileStrings.accountFormLabels.is_subsidiary}
                </FieldLabel>
              }
              labelPlacement="end"
              control={
                <Checkbox
                  checked={Boolean(accountFormData.is_subsidiary)}
                  disabled={isEditingDisabled}
                  inputProps={{
                    disabled: isEditingDisabled,
                  }}
                  name="is_subsidiary"
                  id="is_subsidiary"
                  onChange={(event) => onChangeUpdateField('is_subsidiary', event.target.checked)}
                />
              }
            />
          </Grid>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel
              required={accountFormData.is_subsidiary}
              aria-label={accountProfileStrings.accountFormLabels.parent_org_name}
            >
              {accountProfileStrings.accountFormLabels.parent_org_name}
            </FieldLabel>
            <TextField
              name="parent_org_name"
              id="parent_org_name"
              onChange={(e) => onChangeUpdateField('parent_org_name', e.target.value)}
              value={accountFormData.parent_org_name}
              disabled={!accountFormData.is_subsidiary && isEditingDisabled}
              required={accountFormData.is_subsidiary}
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel
              aria-label={accountProfileStrings.accountFormLabels.arr_org_classification}
              htmlFor="classificationFieldOptions"
            >
              {accountProfileStrings.accountFormLabels.arr_org_classification}
            </FieldLabel>
            <Select
              id="classificationFieldOptions"
              required
              disabled={isEditingDisabled}
              placeholder={profilePage.profileManager.multiselectPrompt}
              isMulti
              isSearchable
              maxMenuHeight={150}
              options={classificationFieldOptions}
              onChange={setAccountClassicationsFieldValue}
              value={accountClassificationsFieldValue}
            />
            {/* <div className='policies-delete-download'>
              <GfwButton
                classNames={`btn-green ${accountData.organization_status_id === 2 ? '' : 'hidden'}`}
                onClick={downloadPolicies}
                value='Download'
              />
            </div> */}
            {/* // ADD BACK IN IF WE NEED TO HAVE PRO MANAGER UPLOAD POLICIES!
              // <input name='org_policy' type='file' onChange={updatePolicy} className='account-info-input' multiple/> */}
          </Grid>
        </Grid>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel
              aria-label={accountProfileStrings.accountFormLabels.arr_org_policy}
              htmlFor="classificationFieldOptions"
            >
              {accountProfileStrings.accountFormLabels.arr_org_policy}
            </FieldLabel>
            <Select
              required
              disabled={isEditingDisabled}
              isMulti
              isSearchable
              maxMenuHeight={150}
              options={policyFieldOptions}
              onChange={(results) => setAccountPoliciesFieldValue(results)}
              value={accountPolicySelectedList}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <Grid container direction="column">
            <FieldLabel aria-label={accountProfileStrings.accountFormLabels.subscription_status_id}>
              {accountProfileStrings.accountFormLabels.subscription_status_id}
            </FieldLabel>
            <FormControl fullWidth>
              <SelectField
                size="small"
                disabled={accountData.organization_status_id === ACCOUNT_ORG_STATUSES['PENDING']}
                required
                value={
                  accountFormData.subscription_status_id !== null
                    ? accountFormData.subscription_status_id
                    : 1
                }
                name="subscription_status_id"
                onChange={(event) =>
                  onChangeUpdateField('subscription_status_id', event.target.value)
                }
                sx={{
                  ...disabledStyles,
                }}
              >
                {subscriptionStatusOptions.map((subsOptions, index) => (
                  <MenuItem key={`status-${index}`} value={subsOptions.value}>
                    {subsOptions.label}
                  </MenuItem>
                ))}
              </SelectField>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={2} rowSpacing={2}>
        <Grid item sm={6} xs={12}>
          <div className="account-profile-submit-button-container">
            <GfwButton
              classNames={`btn-green ${isEditingDisabled ? 'hide' : ''}`}
              onClick={() => updateProAccount(accountFormData)}
              value="Save"
            />
          </div>
        </Grid>
      </Grid>
    </Fragment>
  );
}
