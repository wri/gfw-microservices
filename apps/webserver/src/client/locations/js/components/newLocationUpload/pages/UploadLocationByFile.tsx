import React, { DragEvent, useState } from 'react';
import {
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogTitle,
  Modal,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowForwardIos, Close, DriveFolderUpload } from '@mui/icons-material';

import { PillButton } from '../../../../../components';
import { VALID_UPLOAD_FILE_FORMATS } from '../utils/constants';
import { DataTemplates, NavBar } from '../components';
import { useUploadLocation } from '../contexts';

export function UploadLocationByFile() {
  const theme = useTheme();

  const { clearUploadType } = useUploadLocation();

  const [isDragAndDropActive, setIsDragAndDropActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDataTemplateModalOpen, setIsDataTemplateModalOpen] = React.useState(false);

  const fileUpload = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();

    const target = event.target as HTMLInputElement;

    const file = target.files?.[0] || event.dataTransfer?.files?.[0];

    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !VALID_UPLOAD_FILE_FORMATS.includes(fileExtension)) {
      setIsDialogOpen(true);
      setIsDragAndDropActive(false);
      return;
    }

    console.log('uploading file...');
  };

  const handleFormDragEnter = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDragAndDropActive(true);
  };

  const handleFormDragLeave = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDragAndDropActive(false);
  };

  return (
    <>
      <NavBar />
      <Card sx={{ pt: 1, px: 2, pb: 2 }}>
        <Typography variant="subtitle2">Prepare & Upload Location data</Typography>
        <Typography
          variant="caption"
          color={theme.palette.text.secondary}
          sx={{ display: 'inline-block', mt: 1.25, mx: 0, mb: 3 }}
        >
          First, prepare your data in a format accepted by GFW Pro. Then, upload your file(s).
        </Typography>

        <Typography variant="h6">How to prepare your data</Typography>
        <Typography
          variant="caption"
          color={theme.palette.text.secondary}
          sx={{ display: 'block', my: 1.25, maxWidth: '530px' }}
        >
          Before uploading your data, it must be formatted according to a GFW Pro template. Click
          below to learn more about data formatting and download templates. If you already have your
          data formatted for GFW Pro, just upload it below.
        </Typography>

        <PillButton variant="contained" onClick={() => setIsDataTemplateModalOpen(true)}>
          Data templates
        </PillButton>
        <form
          onDrop={fileUpload}
          onDragEnter={handleFormDragEnter}
          onDragLeave={handleFormDragLeave}
          onDragOver={(e) => e.preventDefault()}
          encType="multipart/form-data"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '354px',
            margin: '1.5rem 0 0.75rem',
            border: '2px dashed #E5E5DE',
            borderRadius: '5px',
            backgroundColor: isDragAndDropActive ? '#FCFCFC' : 'white',
          }}
        >
          <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
            <DriveFolderUpload sx={{ color: '#FFE2BF', fontSize: '5.25rem' }} />
            <input
              type="file"
              id="file-input"
              name="file-input"
              accept={VALID_UPLOAD_FILE_FORMATS.map((f) => `.${f}`).join(', ')}
              style={{ display: 'none' }}
            />
          </label>
          <Typography variant="h6">
            Drop your files here or click to select from your device
          </Typography>
          <Box
            sx={{
              p: 1.25,
              mt: 0.5,
              backgroundColor: theme.palette.background.default,
              maxWidth: '345px',
              borderRadius: '4px',
            }}
          >
            <Typography
              variant="caption"
              sx={{ textTransform: 'uppercase', fontWeight: 'bold', lineHeight: '1.25rem' }}
            >
              Important:
            </Typography>{' '}
            <Typography
              variant="caption"
              color={theme.palette.text.secondary}
              sx={{ lineHeight: '1.25rem' }}
            >
              Data files must be formatted according to GFW Pro requirements - click "Data
              Templates" above to learn more.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', my: 1, mx: 0 }}>
              Accepted filetypes
            </Typography>
            <ul style={{ padding: '0 1rem', margin: 0, color: theme.palette.text.secondary }}>
              <li>
                <Typography variant="caption">CSV or Excel files</Typography>
              </li>
              <li>
                <Typography variant="caption">
                  ZIP file containing a shapefile (SHP, DBF, SHX, and PRJ)
                </Typography>
              </li>
              <li>
                <Typography variant="caption">KML or KMZ files</Typography>
              </li>
            </ul>
          </Box>
        </form>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { sm: 'row', xs: 'column' },
            justifyContent: 'end',
            gap: 1,
          }}
        >
          <PillButton
            variant="contained"
            color="info"
            startIcon={<Close />}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton variant="contained" startIcon={<ArrowForwardIos />}>
            Next
          </PillButton>
        </Box>

        <Modal open={isDataTemplateModalOpen} onClose={() => setIsDataTemplateModalOpen(false)}>
          <DataTemplates handleClose={() => setIsDataTemplateModalOpen(false)} />
        </Modal>

        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Data type not compatible with GFW Pro</DialogTitle>
          <DialogActions>
            <PillButton onClick={() => setIsDialogOpen(false)} autoFocus>
              Ok
            </PillButton>
          </DialogActions>
        </Dialog>
      </Card>
    </>
  );
}
