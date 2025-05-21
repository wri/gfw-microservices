import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Add } from '@mui/icons-material';

import { PillButton } from '../../../../components';
import { useFeatureFlagStateContext } from './FeatureFlagStateContext';
import { featureFlagsStrings } from '../../../../common/js/config';

const formatAccountListDataOptions = (data) => {
  return data.map(({ organization_id, organization_name }) => ({
    orgId: organization_id,
    orgName: organization_name,
  }));
};

function AddCompany() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccountOption, setSelectedAccountOption] = useState(null);
  const { accountList, accountsWithFeatureFlagsByFlagId, addFeatureFlagForAccountId } =
    useFeatureFlagStateContext();

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAccountSelection = () => {
    addFeatureFlagForAccountId(selectedAccountOption?.orgId).then(() => {
      handleClose();
    });
  };

  return (
    <>
      <PillButton size="small" startIcon={<Add />} onClick={handleOpen}>
        Add
      </PillButton>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>{featureFlagsStrings.addCompanyDialogTitle}</DialogTitle>
        <DialogContent>
          <Autocomplete
            disablePortal
            disableCloseOnSelect
            options={formatAccountListDataOptions(accountList)}
            sx={{ width: 552, height: 300, '& input': { border: 0 } }}
            renderInput={(params) => <TextField {...params} />}
            isOptionEqualToValue={(option, value) => option.orgId === value.orgId}
            onChange={(e, v) => setSelectedAccountOption(v)}
            getOptionLabel={(option) => option.orgName}
            getOptionDisabled={(option) => {
              const accountsWithFlags = accountsWithFeatureFlagsByFlagId.map(
                (acc) => acc.organization_id
              );
              return accountsWithFlags.includes(option.orgId);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.orgId}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContents: 'space-between',
                  }}
                >
                  <Box>
                    <Box>{option.orgId}</Box>
                    <Box>{option.orgName}</Box>
                  </Box>
                  <Box>{selected ? 'Selected' : 'Not selected'}</Box>
                </Box>
              </li>
            )}
          />
        </DialogContent>
        <DialogActions>
          <PillButton variant="contained" size="small" color="info" onClick={handleClose}>
            Close
          </PillButton>
          <PillButton
            variant="contained"
            size="small"
            disabled={!selectedAccountOption}
            onClick={handleAccountSelection}
          >
            Add
          </PillButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AddCompany;
