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

export const Routes = {
  LOCATIONS: '',
  OPTIONS: '/upload-location',
  UPLOAD_BY_FILE: '/upload-location/by-file',
  UPLOAD_BY_POLYGON: '/upload-location/by-polygon',
  UPLOAD_BY_POINT: '/upload-location/by-point',
  PREVIEW: '/upload-location/preview',
  CONFIGURE_LIST: '/upload-location/configure-list',
  SUBMIT: '/upload-location/submit',
};

export type RouteType = keyof typeof Routes;

export function UploadLocationRouter() {
  return (
    <ThemeProvider>
      <Box
        className="new-location-upload"
        sx={{ mt: 1.5, mx: 'auto', maxWidth: '1025px', minWidth: '300px' }}
      >
        <Switch>
          <Route path={Routes.OPTIONS} exact>
            <UploadLocationOptions />
          </Route>
          <Route path={Routes.UPLOAD_BY_FILE}>
            <UploadLocationByFile />
          </Route>
          <Route path={Routes.UPLOAD_BY_POLYGON}>
            <UploadLocationByPolygon />
          </Route>
          <Route path={Routes.UPLOAD_BY_POINT}>
            <UploadLocationByPoint />
          </Route>
          <Route path={Routes.CONFIGURE_LIST} component={ConfigureList} />
        </Switch>
      </Box>
    </ThemeProvider>
  );
}
