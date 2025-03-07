import React, { useEffect, useRef, useState } from 'react';
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
import {
  ArrowBackIos,
  ArrowForwardIos,
  Close,
  DriveFolderUpload,
  Replay,
  Report,
} from '@mui/icons-material';
import { getFileExtension } from '../../../../../utils';

import { LocationListType } from '../types';
import { LoadingModal, PillButton } from '../../../../../components';
import {
  getTableColumns,
  LabelNameTable,
  LabelNameTableZip,
  uploadFileToS3,
} from '../utils/upload';
import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { NavBar } from '../components';
import { useFetch } from '../../../../../hooks';
import { VALID_UPLOAD_FILE_FORMATS } from '../utils/constants';

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
    { message: string; errors: string[] }
  >();
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
      const uploadedData = await uploadFileToS3(selectedFile);
      addFile(uploadedData);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsLoadingFileUpload(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const getPreviewData = async () => {
    request({
      method: 'GET',
      url: '/api/list/preview',
      params: {
        path: uploadedFile?.keyFile,
      },
    });
  };

  const getMissingFieldsNames = (errors: string[], fileExtension: string) => {
    if (!errors.length) {
      return '';
    }

    const fields = errors[0].split(':')?.[1]?.trim();
    if (!fields) {
      return '';
    }

    const map = fileExtension === '.zip' ? LabelNameTableZip : LabelNameTable;
    return fields
      .split(',')
      .map((field) => map[field as keyof typeof map] || '')
      .filter(Boolean)
      .join(', ');
  };
  const columns = getTableColumns(data?.features);
  const fileExtension = getFileExtension(uploadedFile?.keyFile);

  return (
    <>
      <NavBar />
      <Card sx={{ pt: 1, px: 2, pb: 2, display: 'flex', flexDirection: 'column', height: '634px' }}>
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
            onClick={() => fileInputRef.current?.click()}
          >
            Retry upload
          </PillButton>
          <input
            type="file"
            ref={fileInputRef}
            accept={VALID_UPLOAD_FILE_FORMATS.map((f) => `.${f}`).join(', ')}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Box>

        {isLoading ? (
          <Skeleton variant="rounded" sx={{ height: '460px' }} />
        ) : error ? (
          <>
            {error.message === 'Validation errors found in the data' ? (
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
                  <Report
                    color="error"
                    sx={{ position: 'absolute', fontSize: '2rem', left: '57px' }}
                  />
                </Box>
                <Typography variant="h6">Missing required fields</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary, my: 1, textAlign: 'center' }}
                >
                  Your {fileExtension} file is missing the following obligatory fields:{' '}
                  {getMissingFieldsNames(error.errors, fileExtension)}. Please check the required
                  fields in the Data Templates and update your file before re-uploading it.
                </Typography>
                <Typography
                  variant="body2"
                  color="error"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Retry upload
                </Typography>
              </Box>
            ) : (
              <Box sx={{ margin: 'auto' }}>
                <Typography variant="h6">There were platform issues loading your data.</Typography>
                <PillButton onClick={getPreviewData} sx={{ margin: 'auto' }}>
                  Click here to try again
                </PillButton>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ maxHeight: '460px', overflow: 'auto' }}>
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
                    <TableCell key={column}>{LabelNameTable[column]}</TableCell>
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
            variant="contained"
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
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton
            variant="contained"
            startIcon={<ArrowForwardIos />}
            onClick={() => history.push('CONFIGURE_LIST')}
            disabled={isLoading || !data?.features || !!error}
          >
            Next
          </PillButton>
        </Box>
        <LoadingModal isLoading={iLoadingFileUpload} />
      </Card>
    </>
  );
}
