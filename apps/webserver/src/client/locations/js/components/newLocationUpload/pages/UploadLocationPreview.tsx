import React, { useEffect, useState } from 'react';
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

import { LocationListType } from '../types';
import { LoadingModal, PillButton } from '../../../../../components';
import { getTableColumns, LabelNameTable, uploadFileToS3 } from '../utils/upload';
import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { NavBar } from '../components';
import { useFetch } from '../../../../../hooks';
import { VALID_UPLOAD_FILE_FORMATS } from '../utils/constants';

export function UploadLocationPreview() {
  const {
    uploadLocationState: { uploadedFileUrl },
    clearUploadType,
    addFileUrl,
  } = useUploadLocation();
  const history = useHistory();
  const theme = useTheme();

  const { data, isLoading, request } = useFetch<{ features: LocationListType[] }>();
  const [file, setFile] = useState<File | null>(null);

  const [iLoadingFileUpload, setIsLoadingFileUpload] = useState(false);

  useEffect(() => {
    if (!uploadedFileUrl) {
      return;
    }

    request({
      method: 'GET',
      url: '/api/list/preview',
      params: {
        path: uploadedFileUrl,
      },
    });
  }, [uploadedFileUrl]);

  useEffect(() => {
    if (!file) {
      return;
    }

    const uploadFile = async () => {
      try {
        setIsLoadingFileUpload(true);
        const data = await uploadFileToS3(file);
        addFileUrl(data);
      } catch (err: unknown) {
        console.log({ err });
      } finally {
        setIsLoadingFileUpload(false);
      }
    };

    uploadFile();
  }, [file]);

  const columns = getTableColumns(data?.features);

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
          >
            <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
              Retry upload
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
        </Box>

        {isLoading ? (
          <Skeleton variant="rounded" sx={{ height: '460px' }} />
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
                  <TableRow key={location.properties.Location_N}>
                    {columns.map((column) => (
                      <TableCell key={column}>{location.properties[column] ?? ''}</TableCell>
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
            disabled={!data?.features}
          >
            Next
          </PillButton>
        </Box>
        <LoadingModal isLoading={iLoadingFileUpload} />
      </Card>
    </>
  );
}
