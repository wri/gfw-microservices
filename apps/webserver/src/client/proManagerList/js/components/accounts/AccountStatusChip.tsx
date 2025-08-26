import { Chip } from '@mui/material';
import { ACCOUNT_ORG_STATUSES } from '../../../../common/js/constants/orgAccountStatuses';

const statusColors: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  Active: 'success',
  Pending: 'warning',
  Closed: 'default',
  Inactive: 'error',
  Unknown: 'default',
};

export const getStatusString = (account) => {
  const { organization_status_id, organization_active } = account;

  if (organization_status_id === ACCOUNT_ORG_STATUSES.PENDING) {
    return organization_active ? 'Pending' : 'Closed';
  }
  if (organization_status_id === ACCOUNT_ORG_STATUSES.ACTIVE) {
    return 'Active';
  }
  if (organization_status_id === ACCOUNT_ORG_STATUSES.INACTIVE) {
    return 'Inactive';
  }
  return 'Unknown';
};

export function AccountStatusChip({ account }) {
  const statusString = getStatusString(account);
  const chipColor = statusColors[statusString] || 'default';

  return <Chip label={statusString} variant="outlined" color={chipColor} />;
}
