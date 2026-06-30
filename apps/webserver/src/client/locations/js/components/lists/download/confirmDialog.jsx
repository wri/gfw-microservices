import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
} from '@mui/material';
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
  const GOT_IT_LABEL = 'Got it';

  const translatedTitle = useTransifexTranslation(DOWNLOAD_TITLE);
  const translatedMessage = useTransifexTranslation(DOWNLOAD_MESSAGE);
  const translatedGotIt = useTransifexTranslation(GOT_IT_LABEL);

  const closeDialog = () => setDialogOpen(false);

  // Callers pass the disclaimer as a component type. Check the type instead of
  // invoking it, so the component is only ever instantiated by React (avoids
  // double-rendering and Rules of Hooks violations).
  const DisclaimerMessage =
    typeof CustomDownloadConfirmationMessage === 'function'
      ? CustomDownloadConfirmationMessage
      : null;

  return (
    <Dialog open={open} onClose={closeDialog}>
      <DialogTitle data-cy="download-dialog">{translatedTitle}</DialogTitle>
      <IconButton
        aria-label="close"
        size="small"
        onClick={closeDialog}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'grey.500',
        }}
      >
        <Close fontSize="small" />
      </IconButton>
      <DialogContent>
        <div className="dialog__prompt">{translatedMessage}</div>
        {DisclaimerMessage && (
          <Box
            className="dialog__disclaimer"
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'grey.100',
            }}
          >
            <DisclaimerMessage />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          data-cy="download-dialog-got-it"
          variant="contained"
          color="primary"
          onClick={closeDialog}
        >
          {translatedGotIt}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
