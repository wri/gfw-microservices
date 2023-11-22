import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { createFeatureFlag } from './featureFlags.utils';


function addCompany({flagName}) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(false);
  const [companys, setCompanys] = useState({});

  useEffect(() => {
    fetch(`/pro-manager-list/accounts`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        cleanCompanysData(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const cleanCompanysData = (companysData) => {
    const cleanData = companysData.accounts.map(({organization_id, organization_name}) => {
      return { id: organization_id, label: organization_name }
    })
    setCompanys(cleanData)
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAdd = () => {
    createFeatureFlag(flagName, company).then(() => handleClose());
  };

  return (
    <>
      <Button onClick={handleOpen}>+ add</Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Select Organization</DialogTitle>
        <DialogContent>
        <Autocomplete
          disablePortal
          options={companys}
          sx={{ width: 552, height: 300, '& input': { border: 0 } }}
          renderInput={(params) => <TextField {...params} />}
          onChange={(e) => setCompany(e)}
        />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>close</Button>
          <button className="gfw-button btn-green" onClick={handleAdd}>
            ADD
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default addCompany;
