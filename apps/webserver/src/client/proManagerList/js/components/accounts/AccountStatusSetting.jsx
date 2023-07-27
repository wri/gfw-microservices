import React from 'react';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import SelectField from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import GfwButton from '../../../../common/js/components/GfwButton';
import { useDialog } from '../../../../common/js/components/Dialog';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';

const disabledStyles = {
  '&.Mui-disabled': {
    backgroundColor: 'rgb(0 0 0 / 4%)',
    cursor: 'not-allowed',
  },
};

/**
 * Displays and Manage Application Status States
 * @param {Number} organization_id Org ID
 * @param {Number} organization_status_id Org Status ID
 */
export default function AccountStatusSetting({ organization_id, organization_status_id }) {
  const dialog = useDialog();

  const activateAccount = () => {
    const route =
      organization_status_id === ACCOUNT_ORG_STATUSES['PENDING']
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
    if (organization_status_id === ACCOUNT_ORG_STATUSES['PENDING']) {
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
    <Grid container spacing={2} rowSpacing={2}>
      <Grid item sm={6} xs={12}>
        <FormControl fullWidth>
          <SelectField
            size="small"
            disabled
            required
            value={organization_status_id}
            name="organization_status_id"
            sx={{
              ...disabledStyles,
            }}
          >
            <MenuItem value={1}>Pending</MenuItem>
            <MenuItem value={2}>Active</MenuItem>
            <MenuItem value={3}>Inactive</MenuItem>
          </SelectField>
        </FormControl>
      </Grid>
      <Grid item sm={6} xs={12}>
        <GfwButton
          classNames={`btn-green ${
            organization_status_id === ACCOUNT_ORG_STATUSES['ACTIVE'] ? 'button-disabled' : ''
          }`}
          disabled={organization_status_id === ACCOUNT_ORG_STATUSES['ACTIVE']}
          onClick={activateAccount}
          value="Activate"
        />
        {organization_status_id === ACCOUNT_ORG_STATUSES['PENDING'] ? null : (
          <GfwButton
            classNames={`btn-green ${
              organization_status_id === ACCOUNT_ORG_STATUSES['INACTIVE'] ? 'button-disabled' : ''
            }`}
            disabled={organization_status_id === ACCOUNT_ORG_STATUSES['INACTIVE']}
            onClick={deactivateAccount}
            value="Deactivate"
          />
        )}
        {organization_status_id === ACCOUNT_ORG_STATUSES['PENDING'] && (
          <GfwButton
            classNames={`btn-green ${organization_status_id === 1 ? '' : 'hidden'}`}
            onClick={deleteAccountRequest}
            value="Delete"
          />
        )}
      </Grid>
    </Grid>
  );
}
