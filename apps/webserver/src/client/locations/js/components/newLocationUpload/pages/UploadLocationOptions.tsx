import './UploadLocationOptions.scss';
import React from 'react';

import { Typography, Card, IconButton, Button, Box } from '@mui/material';
import { ArrowBack, ArrowForwardIos } from '@mui/icons-material';

import { useUploadLocation } from '../contexts';
import { useHistory } from '../hooks';
import { ExternalHelperResource } from '../../../../../components';
import { UploadType, UserList } from '../types';
import { DATA_CY, ExternalLinks } from '../../../../../utils/constants';
import DataFileIcon from '../../../../../assets/icons/data-file.svg';
import ByIDIcon from '../../../../../assets/icons/id-card-icon.svg';
import AddPointIcon from '../../../../../assets/icons/add-point.svg';
import DrawPolygonIcon from '../../../../../assets/icons/draw-polygon.svg';

const ImgIcon: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} style={{ height: '48px', width: '48px', marginLeft: '2px' }} />
);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add Location
            </Typography>
            <Typography variant="body2" className="upload-location-options__main-content__subtitle">
              Choose how you want to add your location data.
            </Typography>
          </Box>
          <ExternalHelperResource
            text="Step-by-step instructions"
            url={ExternalLinks.UploadStepByStepInstructions}
            color="info"
          />
        </Box>

        <div className="upload-location-options__main-content__options__other-options">
          <Typography variant="body2">Choose your preferred method</Typography>

          <Box>
            {/* UploadType.ByFile */}
            <Button
              className="upload-location-options__button"
              data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByFile].ADD}
              onClick={() => {
                selectUploadType(UploadType.ByFile);
                history.push('UPLOAD_BY_FILE');
              }}
              startIcon={<ImgIcon src={DataFileIcon} alt="Data file icon" />}
              sx={{ mt: 2 }}
            >
              <Box sx={{ mt: 1, lineHeight: 1, textTransform: 'none' }}>
                <Typography variant="subtitle2">By Data File</Typography>
                <Typography variant="caption">
                  For single or multiple locations upload a file
                </Typography>
              </Box>
            </Button>

            {/* Upload.ById */}
            <Button
              className="upload-location-options__button"
              data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ById].ADD}
              onClick={() => {
                selectUploadType(UploadType.ById);
                history.push('UPLOAD_BY_ID');
              }}
              startIcon={<ImgIcon src={ByIDIcon} alt="Data file icon" />}
              sx={{ mt: 2 }}
            >
              <Box sx={{ mt: 1, lineHeight: 1, textTransform: 'none' }}>
                <Typography variant="subtitle2">By ID</Typography>
                <Typography variant="caption">
                  For regional and global ID systems such as Brazilian CAR or the Universal Mill
                  List
                </Typography>
              </Box>
            </Button>
          </Box>
        </div>
        <div className="upload-location-options__main-content__options__other-options">
          <Typography variant="body2">Interactive workflows</Typography>
          <Box>
            <Button
              className="upload-location-options__button"
              data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPolygon].ADD}
              onClick={() => {
                selectUploadType(UploadType.ByPolygon);
                history.push('UPLOAD_BY_POLYGON');
              }}
              startIcon={<ImgIcon src={DrawPolygonIcon} alt="Draw polygon icon" />}
            >
              <Box sx={{ mt: 1, lineHeight: 1, textTransform: 'none' }}>
                <Typography variant="subtitle2">Draw Polygon</Typography>
                <Typography variant="caption">
                  Create locations using shapes or coordinate data
                </Typography>
              </Box>
            </Button>

            <Button
              className="upload-location-options__button"
              data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[UploadType.ByPoint].ADD}
              onClick={() => {
                selectUploadType(UploadType.ByPoint);
                history.push('UPLOAD_BY_POINT');
              }}
              startIcon={<ImgIcon src={AddPointIcon} alt="Add point icon" />}
            >
              <Box sx={{ mt: 1, lineHeight: 1, textTransform: 'none' }}>
                <Typography variant="subtitle2">Add Point</Typography>
                <Typography variant="caption">
                  Create locations using an address or specific coordinates
                </Typography>
              </Box>
            </Button>
          </Box>
        </div>
      </Card>
    </div>
  );
}
