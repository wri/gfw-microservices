import { isValidElement } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { PillButton, Link } from '../../../../components';
import './CustomDialog.scss';

export default function CustomDialog({
  open,
  closeAction = null,
  dialogTitle,
  dialogMessage,
  dialogActionConfirm,
}) {
  return (
    <Dialog
      PaperProps={{ className: 'list-diagnostics-dialog dialog-paper' }}
      open={open}
      onClose={closeAction}
    >
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent sx={{ opacity: 1 }}>
        {isValidElement(dialogMessage) ? (
          <>{dialogMessage}</>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: dialogMessage }}></div>
        )}
      </DialogContent>
      <DialogActions>
        <div className="list-diagnostics-dialog__actions">
          {isValidElement(dialogActionConfirm) ? (
            <>{dialogActionConfirm}</>
          ) : (
            <PillButton variant="contained" onClick={dialogActionConfirm}>
              OK
            </PillButton>
          )}
          {closeAction && <Link onClick={closeAction}>Cancel</Link>}
        </div>
      </DialogActions>
    </Dialog>
  );
}
