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

  return <Typography variant="h6">{instructions[fileAttachState]}</Typography>;
}
