import React from 'react';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  renderFormattedDeforestationValueWithIndicator,
  formatDigit,
} from '../../../../locations/js/utils/locationsTableUtils';
import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';
import store from '../../../../locations/js/store';
import { SBTN_NATURAL_FOREST_LOSS } from '../../components/lists/ListDetails/deforestationDisplayFormat.constants';
import { renderCell } from './columns.utils';

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
    Header: () => (
      <ColumnsHeader
        label="Post-2020 Forest Loss"
        infoBubbleId={infoBubbleConfig.post2020ForestLoss}
      />
    ),
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
    Header: () => (
      <ColumnsHeader
        label="Indigenous Territories Overlap"
        infoBubbleId={infoBubbleConfig.post2020ItOverlap}
      />
    ),
    className: 'default-cell td-num',
    id: 'landmark_area',
    Cell: ({ original }) => {
      const { landmarkHA, landmarkPercent } = original;
      return renderFormattedDeforestationValueWithIndicator(landmarkHA, landmarkPercent);
    },
  },
  {
    Header: () => (
      <ColumnsHeader label="Protected Areas" infoBubbleId={infoBubbleConfig.post2020PaOverlap} />
    ),
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
  {
    Header: () => <ColumnsHeader label="Country" />,
    accessor: 'country',
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.country}</span>,
  },

  {
    Header: () => <ColumnsHeader label="State" />,
    accessor: 'state',
    className: 'default-cell td-num',
    id: 'State',
    Cell: ({ original }) => <span>{original?.state}</span>,
  },

  {
    Header: () => <ColumnsHeader label="Sub State" />,
    accessor: 'subState',
    className: 'default-cell td-num',

    Cell: ({ original }) => <span>{original?.subState}</span>,
  },

  {
    Header: () => <ColumnsHeader label="Company ID" />,
    accessor: 'Company ID',
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.['Company ID']}</span>,
  },
  {
    Header: () => <ColumnsHeader label="Analysis Area" />,
    accessor: 'Analysis Area',
    show: false,
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.['Analysis Area']}</span>,
  },

  {
    Header: () => <ColumnsHeader label="Analysis Radius" />,
    accessor: 'Analysis Radius',
    show: false,
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.['Analysis Radius']}</span>,
  },

  {
    Header: () => <ColumnsHeader label="Supplier Name" />,
    accessor: 'Supplier Name',
    show: false,
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.['Supplier Name']}</span>,
  },
];

export default post_2020_risk;
