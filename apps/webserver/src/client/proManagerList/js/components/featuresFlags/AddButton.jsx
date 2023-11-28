import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { createFeatureFlag } from './featureFlags.utils';

function AddButton() {
  const [open, setOpen] = useState(false);
  const [flagName, setFlagName] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAdd = () => {
    createFeatureFlag(flagName).then(() => handleClose());
  };

  return (
    <>
      <button className="gfw-button btn-green" onClick={handleOpen} style={{ float: 'right' }}>
        + add
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Feature Name</DialogTitle>
        <DialogContent>
          <input class="space-element" onChange={setFlagName} />
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

export default AddButton;
