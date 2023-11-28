import React, { Fragment, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useFeatureFlagStateContext } from './FeatureFlagStateContext';
import { featureFlagsStrings } from '../../../../common/js/config';
import GfwButton from '../../../../common/js/components/GfwButton';
import Box from '@mui/material/Box';

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
    addFeatureFlagForAccountId(selectedAccountOption?.organization_id).then(() => {
      handleClose();
    });
  };

  return (
    <Fragment>
      <GfwButton classNames="btn-white" onClick={handleOpen} value="+ ADD" />
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
            onChange={(e) => setSelectedAccountOption(e)}
            getOptionLabel={(option) => option.orgName}
            getOptionDisabled={(option) => {
              const accountsWithFlags = accountsWithFeatureFlagsByFlagId.map(
                (acc) => acc.organization_id
              );
              return accountsWithFlags.includes(option.id);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
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
          <Button onClick={handleClose}>close</Button>
          <GfwButton
            classNames="btn-green"
            disabled={!selectedAccountOption}
            onClick={handleAccountSelection}
            value="ADD"
          />
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default AddCompany;
