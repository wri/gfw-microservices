import { theme } from '../../../../../styles/theme';
import { Box, Typography } from '@mui/material';
import { DriveFolderUpload, Report } from '@mui/icons-material';
import { LabelNameTableZip, LabelNameTable } from '../utils/upload';
import { PillButton } from '../../../../../components';
import { getFileExtension } from '../../../../../utils';

export function UploadLocationPreviewErrorMessage({
  error,
  keyFile,
  onRetryPreviewData,
  onRetryUpload,
}: {
  error: { errors: string[] };
  keyFile?: string;
  onRetryUpload: () => void;
  onRetryPreviewData: () => void;
}) {
  const fileExtension = getFileExtension(keyFile);
  const errorMessage = errorMessageBuilder({ error, fileExtension });

  return (
    <>
      {errorMessage ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '354px',
            margin: '1.5rem 0 0.75rem',
            borderRadius: 1,
            border: `2px solid ${theme.palette.error.main}`,
            backgroundColor: 'error.light',
            position: 'relative',
            px: 25,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <DriveFolderUpload
              sx={{ color: `${theme.palette.error.main}80`, fontSize: '5.25rem' }}
            />
            <Report color="error" sx={{ position: 'absolute', fontSize: '2rem', left: '57px' }} />
          </Box>
          <Typography variant="h6">{errorMessage.title}</Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, my: 1, textAlign: 'center' }}
          >
            {errorMessage.body}
          </Typography>
          <Typography
            variant="body2"
            color="error"
            onClick={onRetryUpload}
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Retry upload
          </Typography>
        </Box>
      ) : (
        <Box sx={{ margin: 'auto' }}>
          <Typography variant="h6">There were platform issues loading your data.</Typography>
          <PillButton onClick={onRetryPreviewData} sx={{ margin: 'auto' }}>
            Click here to try again
          </PillButton>
        </Box>
      )}
    </>
  );
}

const errorMessageBuilder = ({
  error,
  fileExtension,
}: {
  error: { errors: string[] };
  fileExtension: string;
}) => {
  const firstError = error?.errors?.[0];

  if (firstError?.startsWith('Missing mandatory fields:')) {
    return {
      title: 'Missing required fields',
      body: `Your ${fileExtension} file is missing the following obligatory fields: ${getMissingFieldsNames(
        error.errors,
        fileExtension
      )}. Please check the required fields in the Data Templates and update your file before re-uploading it.`,
    };
  }

  if (firstError?.startsWith('Invalid latitude or longitude')) {
    return {
      title: 'Invalid file',
      body: 'Invalid latitude or longitude.',
    };
  }

  if (firstError?.startsWith('Error while parsing the data')) {
    return {
      title: 'Invalid file',
      body: 'Your file is invalid. Please try another one.',
    };
  }

  if (firstError?.startsWith('UML LookUp: did not found lat/long for')) {
    return {
      title: 'Invalid file',
      body: 'Your location does not have a valid UML ID. Please ensure the ID data you entered exists in the Universal Mill List.',
    };
  }

  if (firstError === 'Empty data file') {
    return {
      title: 'Empty data file',
      body: 'Your data file is empty. Please ensure your data file contains at least one location before re-uploading.',
    };
  }

  return null;
};

const getMissingFieldsNames = (errors: string[], fileExtension: string) => {
  if (!errors.length) {
    return '';
  }

  const fields = errors[0].split(':')?.[1];
  if (!fields) {
    return '';
  }

  const map = fileExtension === '.zip' ? LabelNameTableZip : LabelNameTable;
  return fields
    .replaceAll(' ', '')
    .split(',')
    .map((field) => map[field as keyof typeof map] || '')
    .join(', ');
};
