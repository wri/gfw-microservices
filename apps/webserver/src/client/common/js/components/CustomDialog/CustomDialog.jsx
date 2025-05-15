import { isValidElement } from 'react';
import Dialog from 'material-ui/Dialog';

import Button from '../Button';
import LinkButton from '../LinkButton';
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
      contentStyle={{ opacity: 1 }}
      actions={[
        <div className="list-diagnostics-dialog__actions">
          {isValidElement(dialogActionConfirm) ? (
            <>{dialogActionConfirm}</>
          ) : (
            <Button
              className="dialog__primary-action"
              variant="primary"
              label={'OK'}
              onClick={dialogActionConfirm}
            />
          )}
          {closeAction && <LinkButton onClick={closeAction} label={'Cancel'} />}
        </div>,
      ]}
      onRequestClose={closeAction}
    >
      {isValidElement(dialogMessage) ? (
        <>{dialogMessage}</>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: dialogMessage }}></div>
      )}
    </Dialog>
  );
}
