import { useState } from 'react';
import { Grid, TextField, Button } from '@mui/material';
import { useDialog } from '../../../../common/js/components/Dialog';
import { showSuccessBanner } from '../../../../common/js/utils/notifications'; // adjust import
import { useAccountDetail } from './AccountDetailSection';

export default function AccountStatusSetting() {
  const dialog = useDialog();
  const { currentAccount, setCurrentAccount } = useAccountDetail();
  const { organization_id, organization_name } = currentAccount;

  const [name, setName] = useState(organization_name);
  const [loading, setLoading] = useState(false);

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

  return (
    <Grid container spacing={2} alignItems="center">
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
    </Grid>
  );
}
