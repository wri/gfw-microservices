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
            backgroundColor: theme.palette.error[100],
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

type ErrorMessage = {
  title: string;
  body: string;
};

const errorMessageBuilder = ({
  error,
  fileExtension,
  uploadType,
}: {
  error: { errors: string[] };
  fileExtension: string;
  uploadType?: UploadType;
}): ErrorMessage | null => {
  if (!error?.errors?.length) {
    return null;
  }

  const isIdBasedError = uploadType === UploadType.ById;
  let firstError = error?.errors[0];

  // Handle missing mandatory fields
  let missingFieldNames = getMissingFieldsNames(error.errors, fileExtension, isIdBasedError);

  if (!isIdBasedError && missingFieldNames.length < 1) {
    missingFieldNames = getMissingFieldsNames(error.errors, fileExtension, true);
  }

  // Handle special case: delimiter detection
  if (firstError?.startsWith('Unable to auto-detect delimiting character')) {
    firstError = error.errors[1];
  }

  // Mapping of patterns to title/body
  const errorPatterns: Array<{
    match: (msg: string) => boolean;
    message: ErrorMessage;
  }> = [
    {
      match: (msg) => msg.startsWith('Your file is too large'),
      message: {
        title: 'File too large',
        body: 'Your file exceeds the maximum allowed size of 128MB. Please reduce the number of locations or split your data into multiple files before re-uploading.',
      },
    },
    {
      match: (msg) => msg.startsWith('Missing mandatory fields:'),
      message: {
        title: 'Missing required fields',
        body: `Your ${fileExtension} file is missing the following obligatory fields: ${missingFieldNames}. Please check the required fields in the Data Templates and update your file before re-uploading it.`,
      },
    },
    {
      match: (msg) => msg.startsWith('Invalid latitude or longitude'),
      message: {
        title: 'Invalid file',
        body: 'Invalid latitude or longitude.',
      },
    },
    {
      match: (msg) => msg.startsWith('Latitude out of supported range'),
      message: {
        title: 'Invalid file',
        body: 'One or more locations have a latitude outside the supported range. Latitudes must be between 62°S (-62) and 84°N (84). Please check your coordinates and re-upload.',
      },
    },
    {
      match: (msg) => msg.startsWith('Error while parsing the data'),
      message: {
        title: 'Invalid file',
        body: 'Your file is invalid. Please try another one.',
      },
    },
    {
      match: (msg) => msg.startsWith('UML LookUp: '),
      message: {
        title: 'Invalid file',
        body: 'Your location does not have a valid UML ID. Please ensure the ID data you entered exists in the Universal Mill List.',
      },
    },
    {
      match: (msg) => msg === 'Empty data file',
      message: {
        title: 'Empty data file',
        body: 'Your data file is empty. Please ensure your data file contains at least one location before re-uploading.',
      },
    },
    {
      // @see {@link https://gfw.atlassian.net/browse/GPV-4541}
      match: (msg) =>
        msg.startsWith('You have entered an invalid ID not found in the system') ||
        msg.startsWith('CAR LookUp: did not found lat/long for'),
      message: {
        title: 'Invalid file',
        body: 'The defined ID is not recognized by GFW Pro. Please enter a recognized ID system value.',
      },
    },
  ];

  for (const pattern of errorPatterns) {
    if (firstError && pattern.match(firstError)) {
      return pattern.message;
    }
  }

  return null;
};

const getMissingFieldsNames = (errors: string[], fileExtension: string, isByIdWorkflow = false) => {
  if (!errors.length) {
    return '';
  }

  // Choose the appropriate map
  const fieldNamesMap =
    fileExtension === '.zip'
      ? LabelNameTableZip
      : isByIdWorkflow
      ? LabelNameTableIdType
      : LabelNameTable;

  // Filter all missing-fields errors
  const missingFieldsErrors = errors.filter((err) => err.startsWith('Missing mandatory fields'));

  if (missingFieldsErrors.length) {
    // Combine all missing-fields errors into a single string
    const fields = missingFieldsErrors
      .map(
        (err) =>
          err
            .split(':')?.[1]
            ?.split(',')
            .map((f) => f.trim())
            .filter(Boolean) ?? []
      )
      .flat();

    return fields
      .map((field) => {
        const cleanField = field.trim();
        const normalizedKey = Object.keys(fieldNamesMap).find(
          (key) => key.toLowerCase() === cleanField.toLowerCase()
        );
        return normalizedKey
          ? fieldNamesMap[normalizedKey as keyof typeof fieldNamesMap]
          : cleanField;
      })
      .join(', ');
  }

  // Fallback: no missing-fields error, return first error as-is
  return errors[0];
};
