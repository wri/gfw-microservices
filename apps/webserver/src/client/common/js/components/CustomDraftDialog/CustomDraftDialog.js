import React from 'react';
import Dialog from 'material-ui/Dialog';

import Button from '../Button';

export default function CustomDraftDialog({
  open,
  closeAction,
  dialogTitle,
  dialogMessage,
  dialogActionConfirm,
}) {
  return (
    <Dialog
      paperClassName="ListDiagnosticStatusDraft__dialog dialog-paper"
      open={open}
      title={dialogTitle}
      actions={[
        <div className="ListDiagnosticStatusDraft__dialog-actions">
          <Button
            className="dialog__primary-action"
            variant="primary"
            label={'OK'}
            onClick={dialogActionConfirm}
          />
          <Button
            className="dialog__primary-cancel"
            variant="clear"
            label={'Cancel'}
            labelStyle={{ textTransform: 'initial', textDecoration: 'underline' }}
            onClick={closeAction}
          />
        </div>,
      ]}
      onRequestClose={closeAction}
    >
      <div dangerouslySetInnerHTML={{ __html: dialogMessage }}></div>
    </Dialog>
  );
}
