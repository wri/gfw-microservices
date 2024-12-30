import React from 'react';
import { Typography } from '@mui/material';

import { FileAttachState } from '../types';

export function UploadByFileInstructions({
  fileAttachState,
}: {
  fileAttachState: FileAttachState;
}) {
  const instructions = {
    [FileAttachState.NoFile]: 'Drop your files here or click to select from your device',
    [FileAttachState.DragOver]: 'Drop your file',
    [FileAttachState.Uploading]: 'Uploading your file...',
    [FileAttachState.UnsupportedType]: 'Unsupported file type',
    [FileAttachState.UploadFailed]: 'Error uploading your file',
    [FileAttachState.Uploaded]: 'File added successfully!',
  };

  const extraInfo =
    fileAttachState === FileAttachState.UnsupportedType ? (
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', maxWidth: '480px', textAlign: 'center', my: 1 }}
      >
        It looks like the file you uploaded isn't one of GFW Pro's accepted file types. Please try
        again with a compatible format: <b>.csv</b>, <b>.xlsl</b>, <b>.kml</b>, <b>.kmz</b>, or a{' '}
        <b>.zip</b> containing a shapefile.
      </Typography>
    ) : null;

  return (
    <>
      <Typography variant="h6">{instructions[fileAttachState]}</Typography>
      {extraInfo}
    </>
  );
}
