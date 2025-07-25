import { useState } from 'react';
import { ArrowForwardIos, Close } from '@mui/icons-material';
import { Box, Card, Typography, useTheme } from '@mui/material';
import { ExternalHelperResource, PillButton } from '../../../../../components';
import { DATA_CY, ExternalLinks } from '../../../../../utils/constants';
import {
  DataTemplates,
  NavBar,
  UploadByFileFolderIcon,
  UploadByFileInstructions,
} from '../components';
import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { useFileUpload } from '../hooks/useFileUpload';
import { FileAttachState, UploadType } from '../types';
import { VALID_FILE_FORMATS_BY_ID, VALID_UPLOAD_FILE_FORMATS } from '../utils/constants';

export function UploadLocationsByType() {
  const theme = useTheme();
  const history = useHistory();

  const { uploadLocationState, clearUploadType, addFile } = useUploadLocation();
  const { uploadType } = uploadLocationState;
  const [isDataTemplateDialogOpen, setIsDataTemplateDialogOpen] = useState(false);

  const validFileFormats =
    uploadType === UploadType.ById ? VALID_FILE_FORMATS_BY_ID : VALID_UPLOAD_FILE_FORMATS;

  const {
    file,
    fileAttachState,
    fileInputRef,
    fileUpload,
    handleFormDragEnter,
    handleFormDragLeave,
    handleFileChange,
  } = useFileUpload({
    validFileFormats,
    onUploadSuccess: addFile,
  });

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

  // Text content based on uploadType
  const typeConfig = {
    [UploadType.ByFile]: {
      title: 'By Data File: Prepare & Upload Location Data',
      helperText: 'How to format your location data for GFW Pro',
      helperUrl: ExternalLinks.HowToFormatLocationData,
      caption:
        'First, prepare your data in a format accepted by GFW Pro. Then, upload your file(s).',
      instructions:
        'Before uploading your data, it must be formatted according to a GFW Pro template. Click on “Data Templates” to learn more about data formatting and download templates. If you already have your data formatted for GFW Pro, just upload it below.',
      unsupportedTypeMsg: (
        <>
          It looks like the file you uploaded isn't one of GFW Pro's accepted file types. GFW Pro
          supports <b>.csv</b>, <b>.xlsl</b>, <b>.kml</b>, <b>.kmz</b> and a <b>.zip</b> containing
          a <b>shape file</b>. Please try again with a compatible file format.
        </>
      ),
    },
    [UploadType.ById]: {
      title: 'By ID: Prepare & Upload Location Data',
      helperText: 'How to format your location data for GFW Pro',
      helperUrl: ExternalLinks.HowToFormatLocationData,
      caption:
        'Prepare your data in a format accepted by GFW Pro to upload your ID(s) system based.',
      instructions:
        'Before uploading your data, it must be formatted according to a GFW Pro template. Click on “Data Templates” to learn more about data formatting and download templates. If you already have your data formatted for GFW Pro, just upload it below.',
      unsupportedTypeMsg: (
        <>
          It looks like the file you uploaded is not supported for ID-based upload. ID-based upload
          requires a <b>.csv</b> or <b>.xlsl</b> file. Please try again with a compatible file
          format.
        </>
      ),
    },
  };

  const config = typeConfig[uploadType];

  return (
    <>
      <NavBar />
      <Card sx={{ pt: 1, px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">{config.title}</Typography>
          <ExternalHelperResource text={config.helperText} url={config.helperUrl} color="info" />
        </Box>
        <Typography
          variant="caption"
          color={theme.palette.text.secondary}
          sx={{ display: 'inline-block', mt: 1.25, mx: 0, mb: 3 }}
        >
          {config.caption}
        </Typography>

        <Typography variant="subtitle2">How to prepare your data</Typography>
        <Typography
          variant="caption"
          color={theme.palette.text.secondary}
          sx={{ display: 'block', my: 1.25, maxWidth: '530px' }}
        >
          {config.instructions}
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
              {config.unsupportedTypeMsg}
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
                {uploadType === UploadType.ByFile && (
                  <>
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
                  </>
                )}
              </ul>
            </Box>
          )}
        </Box>
        <input
          type="file"
          ref={fileInputRef}
          accept={validFileFormats.map((f) => `.${f}`).join(', ')}
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
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[uploadType].LOCATION_CANCEL}
            color="info"
            startIcon={<Close />}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton
            variant="contained"
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[uploadType].LOCATION_NEXT}
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
