import React from 'react';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  checkValid,
  renderFormattedDeforestationValueWithIndicator,
} from '../../../../locations/js/utils/locationsTableUtils';
import store from '../../../../locations/js/store';
import { SBTN_NATURAL_FOREST_LOSS } from '../../components/lists/ListDetails/deforestationDisplayFormat.constants';

const renderCell = (label) => (checkValid(label) ? <span>{label}</span> : '--');

const post_2020_risk = [
  {
    Header: () => <ColumnsHeader label="Location Name" />,
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.locationName}</span>,
  },
  {
    Header: () => <ColumnsHeader label="Size" />,
    className: 'default-cell td-num',
    Cell: ({ original }) => renderCell(original?.totalAreaHa),
  },
  {
    Header: () => <ColumnsHeader label="Post-20202 Forest Loss" />,
    className: 'default-cell td-num',
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
    Cell: ({ original }) => {
      const { landmarkHA, landmarkPercent } = original;
      return renderFormattedDeforestationValueWithIndicator(landmarkHA, landmarkPercent);
    },
  },
  {
    Header: () => <ColumnsHeader label="Protected Areas" />,
    className: 'default-cell td-num',
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
