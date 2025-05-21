import { Grid, FormControl, Select, MenuItem } from '@mui/material';

import { PillButton } from '../../../../components';
import { useDialog } from '../../../../common/js/components/Dialog';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import { useAccountDetail } from './AccountDetailSection';

const disabledStyles = {
  '&.Mui-disabled': {
    backgroundColor: 'rgb(0 0 0 / 4%)',
    cursor: 'not-allowed',
  },
};

/**
 * @Summary Displays and Manage Application Status States
 */
export default function AccountStatusSetting() {
  const dialog = useDialog();
  const { currentAccount } = useAccountDetail();
  const { organization_id, organization_status_id } = currentAccount;

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
        if (data.errorCode) {
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
            window.location = data.redirect;
          }
          if (data.errorCode) {
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
          <Select
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
          </Select>
        </FormControl>
      </Grid>
      <Grid sx={{ display: 'flex', alignItems: 'end', ml: 2, gap: 1 }}>
        <PillButton
          variant="contained"
          size="small"
          disabled={organization_status_id === ACCOUNT_ORG_STATUSES['ACTIVE']}
          onClick={activateAccount}
        >
          Activate
        </PillButton>
        {organization_status_id === ACCOUNT_ORG_STATUSES['PENDING'] ? null : (
          <PillButton
            variant="contained"
            size="small"
            disabled={organization_status_id === ACCOUNT_ORG_STATUSES['INACTIVE']}
            onClick={deactivateAccount}
          >
            Deactivate
          </PillButton>
        )}
        {organization_status_id === ACCOUNT_ORG_STATUSES['PENDING'] && (
          <PillButton
            variant="contained"
            size="small"
            onClick={deleteAccountRequest}
            sx={{ visibility: organization_status_id === 1 ? '' : 'hidden' }}
          >
            Delete
          </PillButton>
        )}
      </Grid>
    </Grid>
  );
}
