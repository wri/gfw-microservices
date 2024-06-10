import React from 'react';
import Dialog from 'material-ui/Dialog';

import Button from '../Button';
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
      paperClassName="list-diagnostics-dialog dialog-paper"
      open={open}
      title={dialogTitle}
      actions={[
        <div className="list-diagnostics-dialog__actions">
          {React.isValidElement(dialogActionConfirm) ? (
            <>{dialogActionConfirm}</>
          ) : (
            <Button
              className="dialog__primary-action"
              variant="primary"
              label={'OK'}
              onClick={dialogActionConfirm}
            />
          )}
          {closeAction && (
            <Button
              className="dialog__primary-cancel"
              variant="clear"
              label={'Cancel'}
              labelStyle={{ textTransform: 'initial', textDecoration: 'underline' }}
              onClick={closeAction}
            />
          )}
        </div>,
      ]}
      onRequestClose={closeAction}
    >
      {React.isValidElement(dialogMessage) ? (
        <>{dialogMessage}</>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: dialogMessage }}></div>
      )}
    </Dialog>
  );
}
