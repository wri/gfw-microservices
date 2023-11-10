import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

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
    fetch(`/api/feature-flags/`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        flagId: flagName,
      }),
    });
    handleClose();
  };

  return (
    <div>
      <button className="gfw-button btn-green" onClick={handleOpen}>
        + add
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
        <DialogContent>
          <input placeholder="Search for account" class="space-element" onChange={setFlagName} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>close</Button>
          <Button onClick={handleAdd} autoFocus>
            ADD
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AddButton;
