/* eslint-disable no-undef */
import React from 'react';
import Dialog from 'material-ui/Dialog';
import IconTimes from 'common/js/components/icon/IconTimes';
import IconButton from 'common/js/components/IconButton';

const transifex = Transifex.live.translateText;

export default function ConfirmDialog({ open, setDialogOpen, CustomDownloadConfirmationMessage }) {
  const DOWNLOAD_TITLE = 'List file Download';
  const DOWNLOAD_MESSAGE =
    "You have selected a list file for download. Please check your email for your data's download link.";

  const isValudCustomConfirmationMessage =
    CustomDownloadConfirmationMessage && React.isValidElement(CustomDownloadConfirmationMessage());

  return (
    <Dialog open={open} onRequestClose={() => setDialogOpen(false)}>
      <div className="dialog__header" data-cy="download-dialog">
        <h1 className="dialog__title">{transifex(DOWNLOAD_TITLE)}</h1>
        <IconButton icon={<IconTimes />} onClick={() => setDialogOpen(false)} size="large" />
      </div>
      {isValudCustomConfirmationMessage ? (
        <CustomDownloadConfirmationMessage />
      ) : (
        <div className="dialog__prompt">{transifex(DOWNLOAD_MESSAGE)}</div>
      )}
    </Dialog>
  );
}
