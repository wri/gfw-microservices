import { Chip } from '@mui/material';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/org-account-statuses.constants';

const statusColors: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  Active: 'success',
  Pending: 'warning',
  Closed: 'default',
  Inactive: 'error',
  Unknown: 'default',
};

export const getStatusString = (account) => {
  const { organization_status_id, organization_active } = account;
  const isPendingButClosed =
    organization_status_id === ACCOUNT_ORG_STATUSES.PENDING && !organization_active;

  if (isPendingButClosed) {
    return 'Closed';
  }

  const statusMap = {
    [ACCOUNT_ORG_STATUSES.PENDING]: 'Pending',
    [ACCOUNT_ORG_STATUSES.ACTIVE]: 'Active',
    [ACCOUNT_ORG_STATUSES.INACTIVE]: 'Inactive',
  };

  return statusMap[organization_status_id] || 'Unknown';
};

export function AccountStatusChip({ account }) {
  const statusString = getStatusString(account);
  const chipColor = statusColors[statusString] || 'default';

  return <Chip label={statusString} variant="outlined" color={chipColor} />;
}
