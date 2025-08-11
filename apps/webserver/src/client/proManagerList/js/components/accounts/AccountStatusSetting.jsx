import { Grid, Chip, Tooltip } from '@mui/material';
import { PillButton } from '../../../../components';
import { useDialog } from '../../../../common/js/components/Dialog';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';
import { useAccountDetail } from './AccountDetailSection';
import { disabledStyles } from '../../common/formStyles';
import FieldLabel from './FieldLabel';

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
  const { organization_id, organization_status_id } = currentAccount;

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

  const isPending = organization_status_id === ACCOUNT_ORG_STATUSES.PENDING;
  const isActive = organization_status_id === ACCOUNT_ORG_STATUSES.ACTIVE;
  const isInactive = organization_status_id === ACCOUNT_ORG_STATUSES.INACTIVE;

  const getStatusLabel = (statusId) => {
    switch (statusId) {
      case ACCOUNT_ORG_STATUSES.PENDING:
        return 'Pending';
      case ACCOUNT_ORG_STATUSES.ACTIVE:
        return 'Active';
      case ACCOUNT_ORG_STATUSES.INACTIVE:
        return 'Closed';
      default:
        return 'Unknown';
    }
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
        <Chip
          label={getStatusLabel(organization_status_id)}
          variant="outlined"
          color={isActive ? 'success' : isPending ? 'warning' : 'error'}
        />
      </Grid>

      <Grid sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
        {/* Activate */}
        <Tooltip
          title={isActive ? 'Account is already active' : ''}
          disableHoverListener={!isActive}
        >
          <span>
            <PillButton
              variant="contained"
              size="small"
              disabled={isActive}
              sx={disabledStyles}
              onClick={activateAccount}
            >
              Activate
            </PillButton>
          </span>
        </Tooltip>

        {/* Deactivate */}
        <Tooltip
          title={isInactive ? 'Account is already inactive' : ''}
          disableHoverListener={!isInactive}
        >
          <span>
            <PillButton
              variant="contained"
              size="small"
              disabled={isInactive || isPending}
              sx={disabledStyles}
              onClick={deactivateAccount}
            >
              Deactivate
            </PillButton>
          </span>
        </Tooltip>

        {/* Close */}
        <Tooltip
          title={!isPending ? 'Only pending accounts can be closed' : ''}
          disableHoverListener={isPending}
        >
          <span>
            <PillButton
              variant="contained"
              size="small"
              disabled={!isPending}
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
