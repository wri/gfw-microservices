import './index.scss';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Box } from '@mui/material';

import { ThemeProvider } from '../../../../styles/ThemeProvider';
import {
  UploadLocationByFile,
  UploadLocationByPolygon,
  UploadLocationByPoint,
  UploadLocationOptions,
  ConfigureList,
} from './pages';

export const UploadLocationRoutes = {
  LOCATIONS: '/',
  OPTIONS: '/upload-location',
  UPLOAD_BY_FILE: '/upload-location/by-file',
  UPLOAD_BY_POLYGON: '/upload-location/by-polygon',
  UPLOAD_BY_POINT: '/upload-location/by-point',
  PREVIEW: '/upload-location/preview',
  CONFIGURE_LIST: '/upload-location/configure-list',
  SUBMIT: '/upload-location/submit',
};

export type RouteType = keyof typeof UploadLocationRoutes;

export function UploadLocationRouter() {
  return (
    <ThemeProvider>
      <Box
        className="new-location-upload"
        sx={{ mt: 1.5, mx: 'auto', maxWidth: '1025px', minWidth: '300px' }}
      >
        <Switch>
          <Route path={UploadLocationRoutes.OPTIONS} component={UploadLocationOptions} exact />
          <Route path={UploadLocationRoutes.UPLOAD_BY_FILE} component={UploadLocationByFile} />
          <Route
            path={UploadLocationRoutes.UPLOAD_BY_POLYGON}
            component={UploadLocationByPolygon}
          />
          <Route path={UploadLocationRoutes.UPLOAD_BY_POINT} component={UploadLocationByPoint} />
          <Route path={UploadLocationRoutes.CONFIGURE_LIST} component={ConfigureList} />
        </Switch>
      </Box>
    </ThemeProvider>
  );
}
