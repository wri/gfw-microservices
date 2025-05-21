import { useState, createContext, useContext } from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';
import { PillButton } from '../../../../components';

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
    <DialogContext.Provider
      value={{
        isDialogOpen,
        openDialog,
        closeDialog,
        disableDialogAction,
        setDialogTitle,
        setDialogMessage,
      }}
    >
      <Dialog
        classes={{ paper: 'dialog-paper' }}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {Array.isArray(dialogMessage)
            ? dialogMessage.map((str, indx) => <p key={`dialog-message-${indx}`}>{str}</p>)
            : dialogMessage}
        </DialogContent>
        <DialogActions>
          <PillButton
            variant="contained"
            size="small"
            disabled={isDialogActionDisabled}
            autoFocus
            onClick={() => setIsDialogOpen(false)}
          >
            Close
          </PillButton>
        </DialogActions>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
}
