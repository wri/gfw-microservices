import React, { useState, createContext, useContext } from 'react';
import Button from '../../../common/js/components/Button';
import Dialog from 'material-ui/Dialog';

const DialogContext = createContext();

export function useDialog() {
  return useContext(DialogContext);
}

export default function DialogProvider({ children }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogActionDisabled, setIsDialogActionDisabled] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState(null);

  const closeDialog = (onCloseCallback = undefined) => {
    setIsDialogOpen(false);
    onCloseCallback && onCloseCallback();
  };

  const disableDialogAction = (disabled) => {
    setIsDialogActionDisabled(disabled);
  };

  const openDialog = (title, message, actionStatus = false) => {
    setIsDialogOpen(true);
    setDialogTitle(title);
    setDialogMessage(message);
    actionStatus && disableDialogAction(actionStatus);
  };

  return (
    <DialogContext.Provider value={{
      isDialogOpen,
      openDialog,
      closeDialog,
      disableDialogAction,
      setDialogTitle,
      setDialogMessage
    }}>
      <Dialog
        paperClassName="dialog-paper"
        open={isDialogOpen}
        title={dialogTitle}
        actions={[
          <div>
            <Button label="Close" 
              disabled={isDialogActionDisabled} 
              keyboardFocused onClick={() => {
              setIsDialogOpen(false);
            }} />
          </div>,
        ]}
        onRequestClose={() => setIsDialogOpen(false)}
      >
        {Array.isArray(dialogMessage) ? (
          dialogMessage.map((str, indx) => (
            <p key={`dialog-message-${indx}`}>{str}</p>
          ))
        ) : (
          dialogMessage
        )}
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
}
