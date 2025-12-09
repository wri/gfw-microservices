import './index.scss';
import { Route, Switch } from 'react-router-dom';
import { Box } from '@mui/material';
import GDPRFooter from '../../../../common/js/components/GDPRFooter';

import {
  UploadLocationByPolygon,
  UploadLocationByPoint,
  UploadLocationOptions,
  UploadLocationPreview,
  ConfigureList,
  SummaryAndSubmit,
  SubmissionSuccess,
  UploadLocationsByType,
} from './pages';
import { PolygonFromMapPage, UserList } from './types';

export const UploadLocationRoutes = {
  LOCATIONS: '/',
  OPTIONS: '/upload-location',
  UPLOAD_BY_FILE: '/upload-location/by-file',
  UPLOAD_BY_POLYGON: '/upload-location/by-polygon',
  UPLOAD_BY_POINT: '/upload-location/by-point',
  UPLOAD_BY_ID: '/upload-location/by-id',
  PREVIEW: '/upload-location/preview',
  CONFIGURE_LIST: '/upload-location/configure-list',
  SUMMARY_AND_SUBMIT: '/upload-location/summary-and-submit',
  SUBMISSION_SUCCESS: '/upload-location/submission-success',
};

export type RouteType = keyof typeof UploadLocationRoutes;

type UploadLocationRouterProps = {
  userLists: UserList[];
  geoFromMap?: PolygonFromMapPage;
  fromList?: number;
};

export function UploadLocationRouter({
  userLists,
  geoFromMap,
  fromList,
}: UploadLocationRouterProps) {
  return (
    <Box
      className="new-location-upload"
      sx={{ mt: 1.5, mx: 'auto', maxWidth: '1025px', minWidth: '300px' }}
    >
      <Switch>
        <Route path={UploadLocationRoutes.OPTIONS} exact>
          <UploadLocationOptions fromList={fromList} userLists={userLists} />
        </Route>
        <Route path={UploadLocationRoutes.UPLOAD_BY_ID} component={UploadLocationsByType} />
        <Route path={UploadLocationRoutes.UPLOAD_BY_FILE} component={UploadLocationsByType} />
        <Route path={UploadLocationRoutes.UPLOAD_BY_POLYGON}>
          <UploadLocationByPolygon polygonFromMapPage={geoFromMap} />
        </Route>
        <Route path={UploadLocationRoutes.UPLOAD_BY_POINT} component={UploadLocationByPoint} />
        <Route path={UploadLocationRoutes.PREVIEW} component={UploadLocationPreview} />
        <Route path={UploadLocationRoutes.CONFIGURE_LIST}>
          <ConfigureList userLists={userLists} />
        </Route>
        <Route path={UploadLocationRoutes.SUMMARY_AND_SUBMIT} component={SummaryAndSubmit} />
        <Route path={UploadLocationRoutes.SUBMISSION_SUCCESS} component={SubmissionSuccess} />
      </Switch>
      <GDPRFooter variant="app" />
    </Box>
  );
}
