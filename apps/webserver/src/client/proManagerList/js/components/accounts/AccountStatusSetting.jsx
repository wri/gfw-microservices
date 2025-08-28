import { Grid, Tooltip } from '@mui/material';
import { PillButton } from '../../../../components';
import { useDialog } from '../../../../common/js/components/Dialog';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import { useAccountDetail } from './AccountDetailSection';
import { disabledStyles } from '../../common/formStyles';
import FieldLabel from './FieldLabel';
import { AccountStatusChip } from './AccountStatusChip';

/**
 * @Summary Displays and manages the account status settings.
 * Allows activating, deactivating, or deleting the account based on its current status.
 * @description This component provides buttons to activate, deactivate, or delete the account.
 * It uses the current account's status to determine which actions are available.
 * It also handles the dialog for loading states and success/error messages during these actions.
 */
export default function AccountStatusSetting() {
  const dialog = useDialog();
  const { currentAccount } = useAccountDetail();
  const { organization_id, organization_status_id, organization_active } = currentAccount;

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

  const handleAccountAction = async ({
    route,
    loadingTitle,
    loadingMessage,
    successTitle,
    successMessage,
    errorTitle,
    body,
    onSuccessRedirect = true,
  }) => {
    dialog.openDialog(loadingTitle, loadingMessage, true);
    try {
      const response = await fetch(route, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (data.redirect && onSuccessRedirect) {
        dialog.setDialogTitle(successTitle);
        dialog.setDialogMessage(successMessage);
        dialog.closeDialog(() => {
          window.location = data.redirect;
        });
      } else if (data.errorCode) {
        dialog.setDialogTitle(errorTitle);
        dialog.setDialogMessage(
          data.systemMessage?.userMessage || data.systemMessage?.message || 'Unknown error'
        );
        dialog.disableDialogAction(true);
      }
    } catch (err) {
      console.error(`Error in ${route}`, err);
      dialog.setDialogTitle(errorTitle);
      dialog.setDialogMessage('Please reload the page and try again');
      dialog.disableDialogAction(true);
    }
  };

  const activateAccount = () => {
    const isPending = organization_status_id === ACCOUNT_ORG_STATUSES.PENDING;
    handleAccountAction({
      route: isPending ? '/pro-manager/activatePendingAccount' : '/pro-manager/reactivateAccount',
      loadingTitle: 'Please wait',
      loadingMessage: 'Activating Account...',
      successTitle: 'Account Activated',
      successMessage: 'Redirecting...',
      errorTitle: 'Error Activating Account',
      body: { id: organization_id },
    });
  };

  const deactivateAccount = () => {
    handleAccountAction({
      route: '/pro-manager/deactivateAccount',
      loadingTitle: 'Please wait',
      loadingMessage: 'Deactivating...',
      successTitle: 'Account Deactivated',
      successMessage: 'Redirecting...',
      errorTitle: 'Error deactivating account',
      body: { id: organization_id, status: organization_status_id },
    });
  };

  const closePendingAccount = () => {
    if (organization_status_id !== ACCOUNT_ORG_STATUSES.PENDING) {
      return;
    }
    handleAccountAction({
      route: '/pro-manager/closePendingAccount',
      loadingTitle: 'Please wait',
      loadingMessage: 'Deleting account...',
      successTitle: 'Pending Account Closed',
      successMessage: 'Redirecting...',
      errorTitle: 'Error deleting account',
      body: { id: organization_id },
    });
  };

  return (
    <Grid
      container
      spacing={2}
      rowSpacing={2}
      sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}
    >
      <Grid md={2} sm={6} xs={12}>
        <FieldLabel label="Account Status" />
        <AccountStatusChip account={currentAccount} />
      </Grid>

      <Grid sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
        {/* Activate */}
        <Tooltip
          title={status !== 'PENDING' ? 'Only accounts that are Pending can be activated' : ''}
          disableHoverListener={status === 'PENDING'}
        >
          <span>
            {/* wrap needed: disabled buttons block tooltips */}
            <PillButton
              variant="contained"
              size="small"
              disabled={status !== 'PENDING'}
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
          title={status !== 'PENDING' ? 'Only accounts that are Pending can be closed' : ''}
          disableHoverListener={status === 'PENDING'}
        >
          <span>
            <PillButton
              variant="contained"
              size="small"
              disabled={status !== 'PENDING'}
              sx={disabledStyles}
              onClick={closePendingAccount}
            >
              Close
            </PillButton>
          </span>
        </Tooltip>
      </Grid>
    </Grid>
  );
}
