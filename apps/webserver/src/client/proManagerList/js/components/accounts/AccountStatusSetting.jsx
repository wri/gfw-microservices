import { useState } from 'react';
import { Grid, TextField, Button, Tooltip } from '@mui/material';
import { PillButton } from '../../../../components';
import { useDialog } from '../../../../common/js/components/Dialog';
import { showSuccessBanner } from '../../../../common/js/utils/notifications'; // adjust import
import { useAccountDetail } from './AccountDetailSection';
import { disabledStyles } from '../../common/formStyles';
import FieldLabel from './FieldLabel';
import { AccountStatusChip } from './AccountStatusChip';

export default function AccountStatusSetting() {
  const dialog = useDialog();
  const { currentAccount, setCurrentAccount } = useAccountDetail();
  const { organization_id, organization_name, organization_status_id, organization_active } = currentAccount;

  const [name, setName] = useState(organization_name);
  const [loading, setLoading] = useState(false);
  
  const getAccountStatus = (statusId, active) => {
    if (statusId === ACCOUNT_ORG_STATUSES.PENDING) {
      return active ? 'PENDING' : 'CLOSED';
    }
    if (statusId === ACCOUNT_ORG_STATUSES.ACTIVE) {
      return 'ACTIVE';
    }
    if (statusId === ACCOUNT_ORG_STATUSES.INACTIVE) {
      return 'INACTIVE';
    }
    return 'UNKNOWN';
  };

  const status = getAccountStatus(organization_status_id, organization_active);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    dialog.openDialog('Please wait', 'Updating organization name...', true);

    try {
      const response = await fetch('/pro-manager/updateOrgName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: organization_id, name }),
        credentials: 'same-origin',
      });
      const data = await response.json();

      if (data.errorCode) {
        dialog.setDialogTitle('Error');
        dialog.setDialogMessage(data.systemMessage?.userMessage || 'Unknown error');
        dialog.disableDialogAction(true);
        return;
      }

      // Success
      setCurrentAccount({ ...currentAccount, organization_name: name });
      showSuccessBanner('Organization name updated successfully!');
      dialog.closeDialog();
    } catch (err) {
      console.error('Error updating organization name', err);
      dialog.setDialogTitle('Error');
      dialog.setDialogMessage('Failed to update organization name. Please try again.');
      dialog.disableDialogAction(true);
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = () => {
    const isPending = organization_status_id === ACCOUNT_ORG_STATUSES.PENDING;
    handleAccountAction({
      route: isPending
        ? '/pro-manager/activateProAccount'
        : '/pro-manager/activateProActiveAccount',
      loadingTitle: 'Please wait',
      loadingMessage: 'Activating Account...',
      successTitle: 'Success',
      successMessage: 'Redirecting...',
      errorTitle: 'Error Activating Account',
      body: { id: organization_id },
    });
  };

  const deactivateAccount = () => {
    handleAccountAction({
      route: '/pro-manager/deactivateProAccount',
      loadingTitle: 'Please wait',
      loadingMessage: 'Deactivating...',
      successTitle: 'Account Deactivated',
      successMessage: 'Redirecting...',
      errorTitle: 'Error deactivating account',
      body: { id: organization_id, status: organization_status_id },
    });
  };

  const deleteAccountRequest = () => {
    if (organization_status_id !== ACCOUNT_ORG_STATUSES.PENDING) {
      return;
    }
    handleAccountAction({
      route: '/pro-manager/deleteProAccountRequest',
      loadingTitle: 'Please wait',
      loadingMessage: 'Deleting account...',
      successTitle: 'Account Deleted',
      successMessage: 'Redirecting...',
      errorTitle: 'Error deleting account',
      body: { id: organization_id },
    });
  };

    return (
    <Grid container spacing={2} alignItems="center">
  
  return (
    <Grid
      container
      spacing={2}
      rowSpacing={2}
      sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}
    >
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          Save
        </Button>
      </Grid>
      
      <Grid md={2} sm={6} xs={12}>
        <FieldLabel label="Account Status" />
        <AccountStatusChip account={currentAccount} />
      </Grid>

      <Grid sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
        {/* Activate */}
        <Tooltip
          title={status === 'ACTIVE' ? 'Account is already active' : ''}
          disableHoverListener={status !== 'ACTIVE'}
        >
          <span>
            {' '}
            {/* wrap needed: disabled buttons block tooltips */}
            <PillButton
              variant="contained"
              size="small"
              disabled={status === 'ACTIVE' || status === 'CLOSED'}
              sx={disabledStyles}
              onClick={activateAccount}
            >
              Activate
            </PillButton>
          </span>
        </Tooltip>

        {/* Deactivate */}
        <Tooltip
          title={status === 'INACTIVE' ? 'Account is already inactive' : ''}
          disableHoverListener={status !== 'INACTIVE'}
        >
          <span>
            <PillButton
              variant="contained"
              size="small"
              disabled={status !== 'ACTIVE'}
              sx={disabledStyles}
              onClick={deactivateAccount}
            >
              Deactivate
            </PillButton>
          </span>
        </Tooltip>

        {/* Close */}
        <Tooltip
          title={status !== 'PENDING' ? 'Only pending accounts can be closed' : ''}
          disableHoverListener={status === 'PENDING'}
        >
          <span>
            <PillButton
              variant="contained"
              size="small"
              disabled={status !== 'PENDING'}
              sx={disabledStyles}
              onClick={deleteAccountRequest}
            >
              Close
            </PillButton>
          </span>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
