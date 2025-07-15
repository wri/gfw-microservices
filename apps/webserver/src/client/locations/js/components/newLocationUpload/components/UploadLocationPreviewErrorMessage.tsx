import { theme } from '../../../../../styles/theme';
import { Box, Typography } from '@mui/material';
import { DriveFolderUpload, Report } from '@mui/icons-material';
import { LabelNameTableZip, LabelNameTable, LabelNameTableIdType } from '../utils/upload';
import { PillButton } from '../../../../../components';
import { getFileExtension } from '../../../../../utils';
import { useUploadLocation } from '../contexts';
import { UploadType } from '../types';

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
  const { uploadLocationState } = useUploadLocation();
  const { uploadType } = uploadLocationState;
  const errorMessage = errorMessageBuilder({ error, fileExtension, uploadType });

  return (
    <>
      {errorMessage ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
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
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6">There were platform issues loading your data.</Typography>
          <PillButton onClick={onRetryPreviewData}>Click here to try again</PillButton>
        </Box>
      )}
    </>
  );
}

const errorMessageBuilder = ({
  error,
  fileExtension,
  uploadType,
}: {
  error: { errors: string[] };
  fileExtension: string;
  uploadType?: UploadType;
}) => {
  const firstError = error?.errors?.[0];
  const isIdBasedError = uploadType === UploadType.ById;

  if (firstError?.startsWith('Missing mandatory fields:')) {
    return {
      title: 'Missing required fields',
      body: `Your ${fileExtension} file is missing the following obligatory fields: ${getMissingFieldsNames(
        error.errors,
        fileExtension,
        isIdBasedError
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

  // @see {@link https://gfw.atlassian.net/browse/GPV-4541}
  if (firstError?.startsWith('The defined ID system')) {
    return {
      title: 'Invalid file',
      body: `The defined ID is not recognized by GFW Pro. Please enter a recognized ID system value.`,
    };
  }
  if (firstError?.startsWith('CAR LookUp: did not found lat/long for')) {
    return {
      title: 'Invalid file',
      body: `The defined ID is not recognized by GFW Pro. Please enter a recognized ID system value.`,
    };
  }

  return null;
};

const getMissingFieldsNames = (
  errors: string[],
  fileExtension: string,
  isByIdWorkflow: boolean = false
) => {
  if (!errors.length) {
    return '';
  }

  let fields: string[] | string = errors[0].split(':')?.[1];
  if (!fields) {
    return '';
  }

  fields = fields.replaceAll(' ', '').split(',');

  if (fileExtension === '.zip') {
    return fields.map((field) => LabelNameTableZip[field as keyof typeof map] || '').join(', ');
  }

  const map = isByIdWorkflow ? LabelNameTableIdType : LabelNameTable;

  return fields.map((field) => map[field as keyof typeof map] || '').join(', ');
};
