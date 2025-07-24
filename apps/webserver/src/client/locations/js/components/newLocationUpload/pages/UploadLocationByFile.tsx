import { DragEvent, useEffect, useRef, useState, ChangeEvent } from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import { ArrowForwardIos, Close } from '@mui/icons-material';

import { PillButton, ExternalHelperResource } from '../../../../../components';
import { VALID_UPLOAD_FILE_FORMATS } from '../utils/constants';
import {
  DataTemplates,
  NavBar,
  UploadByFileFolderIcon,
  UploadByFileInstructions,
} from '../components';
import { useUploadLocation } from '../contexts';
import { uploadFileToS3 } from '../utils/upload';
import { useHistory } from '../hooks';
import { FileAttachState, UploadType } from '../types';
import { DATA_CY, ExternalLinks } from '../../../../../utils/constants';

export function UploadLocationByFile() {
  const theme = useTheme();
  const history = useHistory();

  const { clearUploadType, addFile } = useUploadLocation();

  const [isDataTemplateDialogOpen, setIsDataTemplateDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileAttachState, setFileAttachState] = useState<FileAttachState>(FileAttachState.NoFile);
  const [dragCounter, setDragCounter] = useState(0); // used to prevent dragleave event from firing when dragging over children
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }

    const uploadFile = async () => {
      try {
        setFileAttachState(FileAttachState.Uploading);
        const data = await uploadFileToS3(file);
        addFile(data);
        setFileAttachState(FileAttachState.Uploaded);
      } catch (err: unknown) {
        setFileAttachState(FileAttachState.UploadFailed);
      }
    };

    uploadFile();
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      setFile(selectedFile);
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
          backgroundColor: theme.palette.primary[200],
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
      <Card sx={{ pt: 1.25, px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">By Data File: Prepare & Upload Location Data</Typography>
          <ExternalHelperResource
            text="Step-by-step instructions"
            url={ExternalLinks.UploadStepByStepInstructions}
            color="info"
          />
        </Box>
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

        <PillButton
          variant="contained"
          data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW.DATA_TEMPLATES}
          onClick={() => setIsDataTemplateDialogOpen(true)}
        >
          Data templates
        </PillButton>
        <Box
          component="form"
          role="form"
          onClick={() => isNoFileAttached && fileInputRef.current?.click()}
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
            cursor: isNoFileAttached ? 'pointer' : 'default',
            marginRight: 0,
          }}
        >
          <UploadByFileFolderIcon fileAttachState={fileAttachState} />

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
              Pro supports <b>.csv</b>, <b>.xlsl</b>, <b>.kml</b>, <b>.kmz</b> and a <b>.zip</b>{' '}
              containing a <b>shape file</b>. Please try again with a compatible file format.
            </Typography>
          )}
          {(fileAttachState === FileAttachState.UnsupportedType ||
            fileAttachState === FileAttachState.UploadFailed) && (
            <PillButton
              variant="text"
              color="error"
              onClick={() => fileInputRef.current?.click()}
              sx={{ mt: 1 }}
            >
              Upload again
            </PillButton>
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
                <li>
                  <Typography variant="caption">GeoJson files</Typography>
                </li>
              </ul>
            </Box>
          )}
        </Box>
        <input
          type="file"
          ref={fileInputRef}
          accept={VALID_UPLOAD_FILE_FORMATS.map((f) => `.${f}`).join(', ')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          data-testid="file-input"
        />

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
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByFile].LOCATION_CANCEL}
            color="info"
            startIcon={<Close />}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton
            variant="contained"
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByFile].LOCATION_NEXT}
            startIcon={<ArrowForwardIos />}
            onClick={() => history.push('PREVIEW')}
            disabled={fileAttachState !== FileAttachState.Uploaded}
          >
            Next
          </PillButton>
        </Box>

        <DataTemplates
          isOpen={isDataTemplateDialogOpen}
          onClose={() => setIsDataTemplateDialogOpen(false)}
        />
      </Card>
    </>
  );
}
