import React, { Fragment, useState, useEffect } from 'react';
import GfwButton from '../../../common/js/components/GfwButton';
import '../../css/AccountProfile.scss';
import { profilePage } from '../../../common/js/config';
import Select from 'react-select';
import { fieldValidations } from '../../../profile/js/utils/validations';
import { useDialog } from './Dialog';

/**
 * Displays and Manage Account Profile Form
 * @param {Object} accountData
 * @param {Boolean} isNotPending organization_status_id !== 1
 * @param {Array} classificationsData
 * @param {Array} policyList
 */
export function AccountProfileForm({
  accountData,
  isNotPending: isEditingDisabled,
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
      return fetch('/pro-manager/updateProAccount', {
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
            dialog.disableDialogAction(false);
          }
        })
        .catch(() => {
          dialog.setDialogTitle('Oops! Something went wrong');
          dialog.setDialogMessage('Please try again.');
          dialog.disableDialogAction(false);
        });
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
      <div className="container">
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper">
              <span className="label required-param">Organization Name</span>
              <input
                value={accountFormData.org_name}
                disabled={isEditingDisabled}
                required
                name="org_name"
                onChange={(e) => onChangeUpdateField('org_name', e.target.value)}
                className="account-info-input"
              />
            </div>
          </div>
        </div>
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper">
              <span className="label required-param">Organization Website</span>
              <input
                value={accountFormData.org_website}
                disabled={isEditingDisabled}
                required
                name="org_website"
                onChange={(e) => onChangeUpdateField('org_website', e.target.value)}
                className="account-info-input"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper">
              <span className="label required-param">Organization Address</span>
              <input
                value={accountFormData.org_address}
                disabled={isEditingDisabled}
                required
                name="org_address"
                onChange={(e) => onChangeUpdateField('org_address', e.target.value)}
                className="account-info-input"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper" style={{ alignSelf: 'center' }}>
              <input
                checked={Boolean(accountFormData.is_subsidiary)}
                disabled={isEditingDisabled}
                name="is_subsidiary"
                type="checkbox"
                onChange={(event) => onChangeUpdateField('is_subsidiary', event.target.checked)}
                className="account-info-input"
              />
              <label htmlFor="is_subsidiary" className="profile-label profile-checkbox__label">
                Is Subsidiary ?
              </label>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper">
              <span
                className={`label ${
                  accountFormData.is_subsidiary ? 'label--block required-param' : ''
                }`}
              >
                Parent Organization
              </span>
              <input
                value={accountFormData.parent_org_name}
                disabled={
                  isEditingDisabled || (!accountFormData.is_subsidiary && isEditingDisabled)
                }
                required={accountFormData.is_subsidiary === true}
                name="parent_org_name"
                onChange={(e) => onChangeUpdateField('parent_org_name', e.target.value)}
                className="account-info-input"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper">
              <span className="label label--block required-param">Account Classifications</span>
              <Select
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
            </div>
          </div>
        </div>
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper">
              <span className="label">Organization Policy</span>
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
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="col">
          <div className="col-content">
            <div className="field-wrapper">
              <span className="label">Subscription Status</span>
              <select
                value={accountFormData.subscription_status_id}
                disabled={isEditingDisabled}
                required
                name="subscription_status_id"
                onChange={(event) =>
                  onChangeUpdateField('subscription_status_id', event.target.value)
                }
              >
                <option value={1}>Standard</option>
                <option value={2}>Premium</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="col">
          <div className="account-profile-submit-button-container">
            <GfwButton
              classNames={`btn-green ${isEditingDisabled ? 'hide' : ''}`}
              onClick={() => updateProAccount(accountFormData)}
              value="Save"
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
}

/**
 * Displays and Manage Application Status States
 * @param {Number} organization_id Org ID
 * @param {Number} organization_status_id Org Status ID
 */
export function AccountStatusSetting({ organization_id, organization_status_id }) {
  const dialog = useDialog();
  const ACCOUNT_STATUSES = {
    PENDING: 1,
    ACTIVE: 2,
    INACTIVE: 3,
  };

  const activateAccount = () => {
    const route =
      organization_status_id === ACCOUNT_STATUSES['PENDING']
        ? '/pro-manager/activateProAccount'
        : '/pro-manager/activateProActiveAccount';

    dialog.openDialog('Please wait', 'Activating Account...', true);
    fetch(route, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: organization_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.redirect) {
          dialog.setDialogTitle('Success');
          dialog.setDialogMessage('Redirecting...');
          dialog.closeDialog(() => {
            window.location = data.redirect;
          });
        }
        if (data.hasOwnProperty('errorCode')) {
          dialog.setDialogTitle('Error Activating Account');
          dialog.setDialogMessage(data.systemMessage.userMessage || data.systemMessage.message);
        }
      })
      .catch((error) => {
        console.error('Error activating account', error);
        dialog.setDialogTitle('Error Activating Account');
        dialog.setDialogMessage('Please reload the page and try again');
        dialog.disableDialogAction(true);
      });
  };

  const deactivateAccount = () => {
    dialog.openDialog('Please wait', 'Deactivating...', true);
    fetch('/pro-manager/deactivateProAccount', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: organization_id,
        status: organization_status_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.redirect) {
          dialog.setDialogTitle('Account Deactivated');
          dialog.setDialogMessage('Redirecting...');
          window.location = data.redirect;
        }
      })
      .catch((error) => {
        console.error('Error deactivating account', error);
        dialog.setDialogTitle('Error deactivating account');
        dialog.setDialogMessage('Please reload the page and try again');
        dialog.disableDialogAction(true);
      });
  };

  const deleteAccountRequest = () => {
    // Ensure the account is in pending state before deletetion
    if (organization_status_id === ACCOUNT_STATUSES['PENDING']) {
      dialog.openDialog('Please wait', 'Deleting account...', true);
      fetch('/pro-manager/deleteProAccountRequest', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: organization_id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.redirect) {
            dialog.setDialogTitle('Account Deleted');
            dialog.setDialogMessage('Redirecting...');
            window.location = res.redirect;
          }
          if (data.hasOwnProperty('errorCode')) {
            dialog.setDialogTitle('Error deleting account');
            dialog.setDialogMessage(data.systemMessage.userMessage);
            dialog.disableDialogAction(true);
          }
        })
        .catch((error) => {
          console.error('Error deleting account', error);
          dialog.setDialogTitle('Error deleting account');
          dialog.setDialogMessage('');
          dialog.disableDialogAction(true);
        });
    }
  };

  return (
    <div className="container">
      <div className="col">
        <div className="col-content">
          <div className="field-wrapper">
            <select
              className="field-block"
              value={organization_status_id}
              disabled
              required
              name="organization_status_id"
            >
              <option value={1}>Pending</option>
              <option value={2}>Active</option>
              <option value={3}>Inactive</option>
            </select>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="col-content">
          <GfwButton
            classNames={`btn-green ${
              organization_status_id === ACCOUNT_STATUSES['ACTIVE'] ? 'button-disabled' : ''
            }`}
            disabled={organization_status_id === ACCOUNT_STATUSES['ACTIVE']}
            onClick={activateAccount}
            value="Activate"
          />
          {organization_status_id === ACCOUNT_STATUSES['PENDING'] ? null : (
            <GfwButton
              classNames={`btn-green ${
                organization_status_id === ACCOUNT_STATUSES['INACTIVE'] ? 'button-disabled' : ''
              }`}
              disabled={organization_status_id === ACCOUNT_STATUSES['INACTIVE']}
              onClick={deactivateAccount}
              value="Deactivate"
            />
          )}
          {organization_status_id === ACCOUNT_STATUSES['PENDING'] && (
            <GfwButton
              classNames={`btn-green ${organization_status_id === 1 ? '' : 'hidden'}`}
              onClick={deleteAccountRequest}
              value="Delete"
            />
          )}
        </div>
      </div>
    </div>
  );
}
