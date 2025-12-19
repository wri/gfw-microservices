import { isValidElement } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { PillButton } from '../../../../components';
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
      sx={{ a: { color: 'primary.main', textDecoration: 'underline' } }}
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
            <PillButton variant="contained" size="small" onClick={dialogActionConfirm}>
              OK
            </PillButton>
          )}
          {closeAction && (
            <PillButton variant="text" size="small" color="info" onClick={closeAction}>
              Cancel
            </PillButton>
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
}
