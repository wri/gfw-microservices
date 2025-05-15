import { Box, useTheme } from '@mui/material';
import { FileAttachState } from '../types';
import { CheckCircle, Downloading, DriveFolderUpload, Report } from '@mui/icons-material';

export function UploadByFileFolderIcon({ fileAttachState }: { fileAttachState: FileAttachState }) {
  const theme = useTheme();
  const icons = {
    [FileAttachState.NoFile]: <DriveFolderUpload sx={{ color: '#FFE2BF', fontSize: '5.25rem' }} />,
    [FileAttachState.DragOver]: (
      <DriveFolderUpload sx={{ color: `${theme.palette.primary.main}80`, fontSize: '5.25rem' }} />
    ),
    [FileAttachState.Uploading]: (
      <Box sx={{ position: 'relative' }}>
        <DriveFolderUpload sx={{ color: `${theme.palette.primary.main}80`, fontSize: '5.25rem' }} />
        <Downloading
          sx={{
            color: 'white',
            backgroundColor: theme.palette.primary.main,
            fontSize: '1.75rem',
            borderRadius: '50%',
            transform: 'scaleY(-1)',
            position: 'absolute',
            left: '57px',
            padding: '3px',
          }}
        />
      </Box>
    ),
    [FileAttachState.UnsupportedType]: (
      <Box sx={{ position: 'relative' }}>
        <DriveFolderUpload sx={{ color: `${theme.palette.error.main}80`, fontSize: '5.25rem' }} />
        <Report color="error" sx={{ position: 'absolute', fontSize: '2rem', left: '57px' }} />
      </Box>
    ),
    [FileAttachState.UploadFailed]: (
      <Box sx={{ position: 'relative' }}>
        <DriveFolderUpload sx={{ color: `${theme.palette.error.main}80`, fontSize: '5.25rem' }} />
        <Report color="error" sx={{ position: 'absolute', fontSize: '2rem', left: '57px' }} />
      </Box>
    ),
    [FileAttachState.Uploaded]: (
      <Box sx={{ position: 'relative' }}>
        <DriveFolderUpload sx={{ color: `${theme.palette.primary.main}80`, fontSize: '5.25rem' }} />
        <CheckCircle
          color="primary"
          sx={{ position: 'absolute', fontSize: '2rem', left: '57px' }}
        />
      </Box>
    ),
  };

  return icons[fileAttachState] || null;
}
