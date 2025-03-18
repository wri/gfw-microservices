import React, { DragEvent, useEffect, useState } from 'react';
import { Box, Card, Modal, Typography, useTheme } from '@mui/material';
import { ArrowForwardIos, Close } from '@mui/icons-material';
import JSZip from 'jszip';

import { PillButton } from '../../../../../components';
import { VALID_ARC_GIS_FILE_FORMATS, VALID_UPLOAD_FILE_FORMATS } from '../utils/constants';
import {
  DataTemplates,
  NavBar,
  UploadByFileFolderIcon,
  UploadByFileInstructions,
} from '../components';
import { useUploadLocation } from '../contexts';
import { uploadFileToS3 } from '../utils/upload';
import { useHistory } from '../hooks';
import { FileAttachState } from '../types';

export function UploadLocationByFile() {
  const theme = useTheme();
  const history = useHistory();

  const { clearUploadType, addFile } = useUploadLocation();

  const [isDataTemplateModalOpen, setIsDataTemplateModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileAttachState, setFileAttachState] = useState<FileAttachState>(FileAttachState.NoFile);
  const [dragCounter, setDragCounter] = useState(0); // used to prevent dragleave event from firing when dragging over children

  useEffect(() => {
    if (!file) {
      return;
    }

    const processFile = async () => {
      try {
        setFileAttachState(FileAttachState.Uploading);

        if (file.name.endsWith('.zip')) {
          const zip = await JSZip.loadAsync(file, { createFolders: false });

          for (const filename in zip.files) {
            if (zip.files[filename].dir) {
              continue;
            }

            const extension = filename.split('.').pop()?.toLowerCase();
            if (!extension || !VALID_ARC_GIS_FILE_FORMATS.includes(extension)) {
              setFileAttachState(FileAttachState.UnsupportedType);
              return;
            }
          }
        }

        const data = await uploadFileToS3(file);
        addFile(data);
        setFileAttachState(FileAttachState.Uploaded);
      } catch (err: unknown) {
        setFileAttachState(FileAttachState.UploadFailed);
      }
    };

    processFile();
  }, [file]);

  const fileUpload = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();

    const target = event.target as HTMLInputElement;
    const attachedFile = target.files?.[0] || event.dataTransfer?.files?.[0];
    if (!attachedFile) {
      return;
    }

    const fileExtension = attachedFile.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !VALID_UPLOAD_FILE_FORMATS.includes(fileExtension)) {
      setFileAttachState(FileAttachState.UnsupportedType);
      return;
    }

    setFile(attachedFile);
  };

  const handleFormDragEnter = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDragCounter((prev) => prev + 1);
    setFileAttachState(FileAttachState.DragOver);
  };

  const handleFormDragLeave = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDragCounter((prev) => Math.max(prev - 1, 0));

    if (dragCounter === 1) {
      setFileAttachState(FileAttachState.NoFile);
    }
  };

  const getStyleProps = () => {
    switch (fileAttachState) {
      case FileAttachState.NoFile:
        return { border: '2px dashed #E5E5DE', backgroundColor: 'white' };
      case FileAttachState.DragOver:
      case FileAttachState.Uploading:
        return {
          border: `2px dashed ${theme.palette.primary.main}`,
          backgroundColor: 'primary.light',
        };
      case FileAttachState.UnsupportedType:
      case FileAttachState.UploadFailed:
        return {
          border: `2px solid ${theme.palette.error.main}`,
          backgroundColor: 'error.light',
        };
      case FileAttachState.Uploaded:
        return {
          border: `2px solid ${theme.palette.primary.main}`,
          backgroundColor: 'background.default',
        };
    }
  };

  const isNoFileAttached = fileAttachState === FileAttachState.NoFile;

  return (
    <>
      <NavBar />
      <Card sx={{ pt: 1, px: 2, pb: 2 }}>
        <Typography variant="h6">Prepare & Upload Location data</Typography>
        <Typography
          variant="caption"
          color={theme.palette.text.secondary}
          sx={{ display: 'inline-block', mt: 1.25, mx: 0, mb: 3 }}
        >
          First, prepare your data in a format accepted by GFW Pro. Then, upload your file(s).
        </Typography>

        <Typography variant="subtitle2">How to prepare your data</Typography>
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
        <Box
          component="form"
          role="form"
          onDrop={fileUpload}
          onDragEnter={handleFormDragEnter}
          onDragLeave={handleFormDragLeave}
          onDragOver={(e) => e.preventDefault()}
          encType="multipart/form-data"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '354px',
            margin: '1.5rem 0 0.75rem',
            borderRadius: 1,
            ...getStyleProps(),
          }}
        >
          <label
            htmlFor="file-input"
            style={{ cursor: isNoFileAttached ? 'pointer' : 'default', marginRight: 0 }}
          >
            <UploadByFileFolderIcon fileAttachState={fileAttachState} />
            {isNoFileAttached && (
              <input
                type="file"
                id="file-input"
                name="file-input"
                data-testid="file-input"
                accept={VALID_UPLOAD_FILE_FORMATS.map((f) => `.${f}`).join(', ')}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setFile(file);
                }}
              />
            )}
          </label>
          <UploadByFileInstructions fileAttachState={fileAttachState} />
          {(fileAttachState === FileAttachState.Uploading ||
            fileAttachState === FileAttachState.Uploaded) && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {file?.name ?? ''}
            </Typography>
          )}
          {fileAttachState === FileAttachState.UnsupportedType && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', maxWidth: '480px', textAlign: 'center', my: 1 }}
            >
              It looks like the file you uploaded isn't one of GFW Pro's accepted file types. GFW
              Pro supports{' '}
              {VALID_UPLOAD_FILE_FORMATS.map((format, index, array) => (
                <React.Fragment key={format}>
                  <b>.{format}</b>
                  {index < array.length - 2 ? ', ' : index === array.length - 2 ? ' and ' : ''}
                </React.Fragment>
              ))}{' '}
              containing a <b>shape file</b>. Please try again with a compatible file format.
            </Typography>
          )}
          {(fileAttachState === FileAttachState.UnsupportedType ||
            fileAttachState === FileAttachState.UploadFailed) && (
            <>
              <PillButton variant="text">
                <label
                  htmlFor="file-input"
                  style={{
                    cursor: 'pointer',
                    textTransform: 'none',
                    textDecoration: 'underline',
                    color: theme.palette.error.main,
                  }}
                >
                  Upload again
                </label>
              </PillButton>
              <input
                type="file"
                id="file-input"
                accept={VALID_UPLOAD_FILE_FORMATS.map((f) => `.${f}`).join(', ')}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setFile(file);
                }}
              />
            </>
          )}
          {isNoFileAttached && (
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
                    ZIP file containing a shape file (SHP, DBF, SHX, and PRJ)
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">KML or KMZ files</Typography>
                </li>
              </ul>
            </Box>
          )}
        </Box>

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
          <PillButton
            variant="contained"
            startIcon={<ArrowForwardIos />}
            onClick={() => history.push('PREVIEW')}
            disabled={fileAttachState !== FileAttachState.Uploaded}
          >
            Next
          </PillButton>
        </Box>

        <Modal open={isDataTemplateModalOpen} onClose={() => setIsDataTemplateModalOpen(false)}>
          <DataTemplates handleClose={() => setIsDataTemplateModalOpen(false)} />
        </Modal>
      </Card>
    </>
  );
}
