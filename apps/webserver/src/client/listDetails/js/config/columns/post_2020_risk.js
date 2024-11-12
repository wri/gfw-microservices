import React from 'react';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  checkValid,
  renderFormattedDeforestationValueWithIndicator,
  formatDigit,
} from '../../../../locations/js/utils/locationsTableUtils';
import store from '../../../../locations/js/store';
import { SBTN_NATURAL_FOREST_LOSS } from '../../components/lists/ListDetails/deforestationDisplayFormat.constants';

const renderCell = (label) => (checkValid(label) ? <span>{label}</span> : '--');
const { naturalForestLossDataSource } = store.getState();
const post_2020_risk = [
  {
    Header: () => <ColumnsHeader label="Location Name" />,
    className: 'default-cell td-num',
    id: 'Location Name',
    Cell: ({ original }) => <span>{original?.locationName}</span>,
  },
  {
    Header: () => <ColumnsHeader label="Size (ha)" />,
    className: 'default-cell td-num',
    id: 'total_area_ha',
    Cell: ({ original }) => renderCell(formatDigit(original?.totalAreaHa)),
  },
  {
    Header: () => <ColumnsHeader label="Post-2020 Forest Loss" />,
    className: 'default-cell td-num',
    id:
      naturalForestLossDataSource === SBTN_NATURAL_FOREST_LOSS
        ? 'natural_land_deforested_area'
        : 'jrc_land_deforested_area',
    Cell: ({ original }) => {
      const {
        naturalForestLossHA,
        jrcNaturalForestLossHA,
        naturalForestLossPercent,
        jrcNaturalForestLossPercent,
      } = original;
      const { naturalForestLossDataSource } = store.getState();

      const valueInHectares =
        naturalForestLossDataSource === SBTN_NATURAL_FOREST_LOSS
          ? naturalForestLossHA
          : jrcNaturalForestLossHA;
      const valueInPercentage =
        naturalForestLossDataSource === SBTN_NATURAL_FOREST_LOSS
          ? naturalForestLossPercent
          : jrcNaturalForestLossPercent;
      return renderFormattedDeforestationValueWithIndicator(valueInHectares, valueInPercentage);
    },
  },
  {
    Header: () => <ColumnsHeader label="Indigenous Territories Overlap" />,
    className: 'default-cell td-num',
    id: 'landmark_area',
    Cell: ({ original }) => {
      const { landmarkHA, landmarkPercent } = original;
      return renderFormattedDeforestationValueWithIndicator(landmarkHA, landmarkPercent);
    },
  },
  {
    Header: () => <ColumnsHeader label="Protected Areas" />,
    className: 'default-cell td-num',
    id: 'protected_areas_area',
    Cell: ({ original }) => {
      const { protectedAreasHA, protectedAreasPercent } = original;
      return renderFormattedDeforestationValueWithIndicator(
        protectedAreasHA,
        protectedAreasPercent
      );
    },
  },
];

export default post_2020_risk;
