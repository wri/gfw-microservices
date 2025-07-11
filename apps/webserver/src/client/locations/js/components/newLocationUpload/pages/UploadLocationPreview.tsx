import { useEffect, useRef, useState, ChangeEvent } from 'react';
import {
  Box,
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, Close, Replay } from '@mui/icons-material';

import { LocationListType, UploadType } from '../types';
import { LoadingModal, PillButton } from '../../../../../components';
import { getTableColumns, LabelNameTable, uploadFileToS3 } from '../utils/upload';
import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { NavBar, UploadLocationPreviewErrorMessage, FileValidationHelper } from '../components';
import { useFetch } from '../../../../../hooks';
import { VALID_UPLOAD_FILE_FORMATS } from '../utils/constants';
import { fetchListPreview } from '../../../../../api/list';
import { DATA_CY } from '../../../../../utils/constants';

export function UploadLocationPreview() {
  const {
    uploadLocationState: { uploadedFile },
    clearUploadType,
    addFile,
  } = useUploadLocation();
  const history = useHistory();
  const theme = useTheme();

  const { data, isLoading, request, error } = useFetch<
    { features: LocationListType[] },
    { errors: string[] }
  >();
  const [apiRequestError, setApiRequestError] = useState<{
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [iLoadingFileUpload, setIsLoadingFileUpload] = useState(false);

  useEffect(() => {
    if (!uploadedFile?.keyFile) {
      return;
    }

    getPreviewData();
  }, [uploadedFile]);

  const handleFileUpload = async (selectedFile: File) => {
    try {
      setIsLoadingFileUpload(true);
      setApiRequestError(null);
      const uploadedData = await uploadFileToS3(selectedFile);
      addFile(uploadedData);
    } catch (err) {
      console.error('Upload error:', err);
      setApiRequestError({ errors: [''] });
    } finally {
      setIsLoadingFileUpload(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const getPreviewData = async () => {
    if (uploadedFile?.keyFile) {
      fetchListPreview(request, uploadedFile.keyFile);
    }
  };

  const columns = getTableColumns(data?.features);

  useEffect(() => {
    if (data?.features.length === 0) {
      setApiRequestError({ errors: ['Empty data file'] });
    }
  }, [data]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <Card sx={{ height: '80vh', pt: 1, px: 2, pb: 2, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { sm: 'row', xs: 'column' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">List Preview</Typography>
            <Typography
              variant="caption"
              color={theme.palette.text.secondary}
              sx={{ display: 'inline-block', mt: 1.25, mx: 0, mb: 3 }}
            >
              This is a preview of the first 10 rows of data in your location file. Please review to
              ensure that fields and data format look as you expect. If you see any issues, please
              check / correct your file and re-upload.
            </Typography>
          </Box>

          <PillButton
            variant="contained"
            color="info"
            disabled={isLoading || iLoadingFileUpload}
            startIcon={<Replay />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByFile].PREVIEW_RETRY}
            onClick={() => fileInputRef.current?.click()}
          >
            Re-upload file
          </PillButton>
          <input
            type="file"
            ref={fileInputRef}
            accept={VALID_UPLOAD_FILE_FORMATS.map((f) => `.${f}`).join(', ')}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            data-testid="file-input"
          />
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" sx={{ flex: 1 }} />
        ) : error ? (
          <UploadLocationPreviewErrorMessage
            error={error}
            onRetryUpload={() => fileInputRef.current?.click()}
            onRetryPreviewData={getPreviewData}
          />
        ) : apiRequestError ? (
          <UploadLocationPreviewErrorMessage
            error={apiRequestError}
            onRetryUpload={() => fileInputRef.current?.click()}
            onRetryPreviewData={getPreviewData}
          />
        ) : (
          <Box sx={{ overflow: 'auto' }}>
            <Table
              stickyHeader
              aria-label="sticky table"
              sx={{
                fontSize: theme.typography.fontSize,
                borderTop: `1px solid ${theme.palette.info.main}`,
                borderRight: `1px solid ${theme.palette.info.main}`,
                borderLeft: `1px solid ${theme.palette.info.main}`,
              }}
            >
              <TableHead sx={{ background: theme.palette.background.default }}>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column}>{LabelNameTable[column] || column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.features?.map((location) => (
                  <TableRow
                    key={location.properties?.Location_N ?? location.properties?.locationName}
                  >
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {location.properties?.[column] &&
                        typeof location.properties[column] !== 'object'
                          ? location.properties[column]
                          : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {!apiRequestError && <FileValidationHelper sx={{ my: 2 }} />}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { sm: 'row', xs: 'column' },
            justifyContent: 'end',
            gap: 1,
            mt: 'auto',
            width: '100%',
          }}
        >
          <PillButton
            color="info"
            startIcon={<ArrowBackIos />}
            onClick={history.goBack}
            sx={{ mr: 'auto' }}
          >
            Back
          </PillButton>

          <PillButton
            variant="contained"
            color="info"
            startIcon={<Close />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByFile].PREVIEW_CANCEL}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton
            variant="contained"
            startIcon={<ArrowForwardIos />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByFile].PREVIEW_NEXT}
            onClick={() => history.push('CONFIGURE_LIST')}
            disabled={isLoading || !data?.features || !!error || !!apiRequestError}
          >
            Next
          </PillButton>
        </Box>
        <LoadingModal isLoading={iLoadingFileUpload} />
      </Card>
    </Box>
  );
}
