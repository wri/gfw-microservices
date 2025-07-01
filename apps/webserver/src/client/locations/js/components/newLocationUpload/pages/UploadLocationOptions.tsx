import './UploadLocationOptions.scss';
import React from 'react';

import { Typography, Card, IconButton, Button } from '@mui/material';
import {
  UploadFileTwoTone,
  ScatterPlotTwoTone,
  Timeline,
  ArrowBack,
  ArrowForwardIos,
} from '@mui/icons-material';

import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { ExternalHelperResource } from '../../../../../components';
import { UploadType, UserList } from '../types';
import { DATA_CY } from '../../../../../utils/constants';

type UploadLocationOptionsProps = {
  fromList?: number;
  userLists?: UserList[];
};

export function UploadLocationOptions({ fromList, userLists }: UploadLocationOptionsProps) {
  const history = useHistory();
  const { selectUploadType } = useUploadLocation();

  const getRedirectLocation = (fromList: number) => {
    if (fromList) {
      return {
        href: `/list-details?id=${fromList}`,
        onClick: () => null,
        pageName: userLists.find((l) => l.id === fromList)?.list_name || 'List',
      };
    }

    return {
      href: '/locations',
      onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        history.push('LOCATIONS');
      },
      pageName: 'Locations',
    };
  };

  const { pageName, ...backButtonProps } = getRedirectLocation(fromList);

  return (
    <div className="upload-location-options">
      <nav>
        <IconButton {...backButtonProps}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">{pageName}</Typography>
        <ArrowForwardIos fontSize="small" />
        <Typography variant="h5">Add location</Typography>
      </nav>
      <Card className="upload-location-options__main-content">
        <div>
          <Typography variant="h6">Add Location</Typography>
          <Typography variant="body2" className="upload-location-options__main-content__subtitle">
            GFW Pro allows users to upload their data in multiple ways.
          </Typography>
          <ExternalHelperResource
            text="How to format your location data for GFW Pro"
            url="https://globalforestwatch.org/help/gfw-pro/guides/complete-selected-template"
          />
        </div>
        <div className="upload-location-options__main-content__options">
          <Typography variant="body2">
            Best for multiple location or if your data is contained within a file.
          </Typography>

          <Button
            className="upload-location-options__button"
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByFile].ADD}
            onClick={() => {
              selectUploadType(UploadType.ByFile);
              history.push('UPLOAD_BY_FILE');
            }}
            startIcon={<UploadFileTwoTone color="primary" fontSize="large" />}
          >
            File upload
          </Button>
          <div className="upload-location-options__main-content__options__other-options">
            <Typography variant="body2">Or</Typography>
            <Typography variant="body2">
              If you would like to enter a single location without uploading a file, you can define
              your location via one of our interactive workflows:
            </Typography>
            <div>
              <Button
                className="upload-location-options__button"
                data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPoint].ADD}
                onClick={() => {
                  selectUploadType(UploadType.ByPoint);
                  history.push('UPLOAD_BY_POINT');
                }}
                startIcon={<ScatterPlotTwoTone color="primary" fontSize="large" />}
              >
                Point
              </Button>

              <Button
                className="upload-location-options__button"
                data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPolygon].ADD}
                onClick={() => {
                  selectUploadType(UploadType.ByPolygon);
                  history.push('UPLOAD_BY_POLYGON');
                }}
                startIcon={<Timeline color="primary" fontSize="large" />}
              >
                Polygon
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
