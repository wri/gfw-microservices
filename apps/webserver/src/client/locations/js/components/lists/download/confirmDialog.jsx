import { isValidElement } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

import { useTransifexTranslation } from '../../../../../hooks';

export default function ConfirmDialog({
  open,
  setDialogOpen,
  CustomDownloadConfirmationMessage = '',
}) {
  const DOWNLOAD_TITLE = 'List file Download';
  const DOWNLOAD_MESSAGE =
    "You have selected a list file for download. Please check your email for your data's download link.";

  const translatedTitle = useTransifexTranslation(DOWNLOAD_TITLE);
  const translatedMessage = useTransifexTranslation(DOWNLOAD_MESSAGE);

  const isValidCustomConfirmationMessage =
    CustomDownloadConfirmationMessage && isValidElement(CustomDownloadConfirmationMessage());

  return (
    <Dialog open={open} onClose={() => setDialogOpen(false)}>
      <DialogTitle data-cy="download-dialog">{translatedTitle}</DialogTitle>
      <IconButton
        aria-label="close"
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
        onClick={() => setDialogOpen(false)}
      >
        <Close />
      </IconButton>
      <DialogContent>
        {isValidCustomConfirmationMessage ? (
          <CustomDownloadConfirmationMessage />
        ) : (
          <div className="dialog__prompt">{translatedMessage}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
