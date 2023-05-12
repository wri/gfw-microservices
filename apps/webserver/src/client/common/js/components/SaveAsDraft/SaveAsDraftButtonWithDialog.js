import React, { useState } from 'react';

import SaveAsDraftButton from './SaveAsDraftButton';
import CustomDraftDialog from '../CustomDraftDialog/CustomDraftDialog';

const DIALOG_TITLE = 'Are you sure?';
const DIALOG_MESSAGE =
  'Click OK to save this list as a draft. You will be navigated back to the Locations page upon saving this list. This list will not be analyzed until it is submitted.';

export default function SaveAsDraftButtonWithDialog({
  saveLocations,
  dialogTitle = DIALOG_TITLE,
  dialogMessage = DIALOG_MESSAGE,
  disabled,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SaveAsDraftButton onClick={() => setDialogOpen(true)} disabled={disabled} />

      <CustomDraftDialog
        open={dialogOpen}
        closeAction={() => setDialogOpen(false)}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        dialogActionConfirm={() => {
          saveLocations();
          setDialogOpen(false);
        }}
      />
    </>
  );
}
