import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  renderPercentageValueWithIndicator,
  renderFormattedDeforestationValueWithIndicator,
  formatDigit,
} from '../../../../locations/js/utils/locationsTableUtils';
import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';
import { renderCell } from './columns.utils';

const sizeLabel = Transifex.live.translateText('Size (ha)');

const post_2020_risk = [
  {
    Header: () => <ColumnsHeader label="Location Name" />,
    className: 'default-cell td-num',
    id: 'Location Name',
    Cell: ({ original }) => <span>{original?.locationName}</span>,
  },
  {
    Header: () => <ColumnsHeader label={sizeLabel} />,
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
    accessor: 'naturalForestLossPercent',

    Cell: ({ original }) => (
      <span>{renderPercentageValueWithIndicator(original?.naturalForestLossPercent)}</span>
    ),
  },

  {
    Header: () => (
      <ColumnsHeader
        label="Post-2020 Forest Loss"
        infoBubbleId={infoBubbleConfig.post2020ForestLoss}
      />
    ),
    className: 'default-cell td-num',
    accessor: 'jrcNaturalForestLossPercent',

    Cell: ({ original }) => (
      <span>{renderPercentageValueWithIndicator(original?.jrcNaturalForestLossPercent)}</span>
    ),
  },

  {
    Header: () => (
      <ColumnsHeader
        label="Post-2020 Forest Loss"
        infoBubbleId={infoBubbleConfig.post2020ForestLoss}
      />
    ),
    className: 'default-cell td-num',
    accessor: 'natural_land_deforested_area',

    Cell: ({ original }) => {
      const { naturalForestLossHA } = original;

      return renderFormattedDeforestationValueWithIndicator(naturalForestLossHA);
    },
  },

  {
    Header: () => (
      <ColumnsHeader
        label="Post-2020 Forest Loss"
        infoBubbleId={infoBubbleConfig.post2020ForestLoss}
      />
    ),
    className: 'default-cell td-num',
    accessor: 'jrc_land_deforested_area',

    Cell: ({ original }) => {
      const { jrcNaturalForestLossHA } = original;

      return renderFormattedDeforestationValueWithIndicator(jrcNaturalForestLossHA);
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
    accessor: 'landmarkPercent',
    Cell: ({ original }) => (
      <span>{renderPercentageValueWithIndicator(original?.landmarkPercent)}</span>
    ),
  },

  {
    Header: () => (
      <ColumnsHeader
        label="Indigenous Territories Overlap"
        infoBubbleId={infoBubbleConfig.post2020ItOverlap}
      />
    ),
    className: 'default-cell td-num',
    accessor: 'landmark_area',
    Cell: ({ original }) => {
      const { landmarkHA } = original;
      return renderFormattedDeforestationValueWithIndicator(landmarkHA);
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
    accessor: 'protectedAreasPercent',
    Cell: ({ original }) => (
      <span>{renderPercentageValueWithIndicator(original?.protectedAreasPercent)}</span>
    ),
  },
  {
    Header: () => (
      <ColumnsHeader label="Protected Areas" infoBubbleId={infoBubbleConfig.post2020PaOverlap} />
    ),
    className: 'default-cell td-num',
    accessor: 'protected_areas_area',
    Cell: ({ original }) => {
      const { protectedAreasHA } = original;
      return renderFormattedDeforestationValueWithIndicator(protectedAreasHA);
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
  {
    Header: () => <ColumnsHeader label="Facility Name" />,
    accessor: 'Facility Name',
    show: false,
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.['Facility Name']}</span>,
  },
  {
    Header: () => <ColumnsHeader label="Owner Name" />,
    accessor: 'Owner Name',
    show: false,
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.['Owner Name']}</span>,
  },
  {
    Header: () => <ColumnsHeader label="Owner ID" />,
    accessor: 'Owner ID',
    show: false,
    className: 'default-cell td-num',
    Cell: ({ original }) => <span>{original?.['Owner ID']}</span>,
  },
];

export default post_2020_risk;
