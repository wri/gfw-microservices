import ColumnsHeader from '../../components/columns/ColumnsHeader';
import { columnHeaders } from './columnHeaders.constants';
import {
  renderPercentageValueWithIndicator,
  renderFormattedDeforestationValueWithIndicator,
  formatDigit,
} from '../../../../locations/js/utils/locationsTableUtils';
import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';
import { renderCell } from './columns.utils';
import store from '../../../../locations/js/store';
import {
  SBTN_NATURAL_FOREST_LOSS,
  JRC_NATURAL_FOREST_LOSS,
  DISPLAY_FORMAT_PERCENTAGE,
} from '../../components/lists/ListDetails/deforestationDisplayFormat.constants';

const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;
const sizeLabel = () => transifex(columnHeaders.sizeInHa);

// Function that creates columns array with getter properties for show
const getColumnsWithCurrentState = () => {
  return [
    {
      Header: () => <ColumnsHeader label="Location Name" />,
      className: 'default-cell td-num',
      id: 'Location Name',
      Cell: ({ original }) => <span>{original?.locationName}</span>,
    },
    {
      Header: () => <ColumnsHeader label={sizeLabel()} />,
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
      get show() {
        const { naturalForestLossDataSource, deforestationDisplayFormat } = store.getState();
        return (
          naturalForestLossDataSource === SBTN_NATURAL_FOREST_LOSS &&
          deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE
        );
      },
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
      get show() {
        const { naturalForestLossDataSource, deforestationDisplayFormat } = store.getState();
        return (
          naturalForestLossDataSource === JRC_NATURAL_FOREST_LOSS &&
          deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE
        );
      },
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
      get show() {
        const { naturalForestLossDataSource, deforestationDisplayFormat } = store.getState();
        return (
          naturalForestLossDataSource === SBTN_NATURAL_FOREST_LOSS &&
          deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE
        );
      },
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
      get show() {
        const { naturalForestLossDataSource, deforestationDisplayFormat } = store.getState();
        return (
          naturalForestLossDataSource === JRC_NATURAL_FOREST_LOSS &&
          deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE
        );
      },
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
      get show() {
        const { deforestationDisplayFormat } = store.getState();
        return deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE;
      },
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
      get show() {
        const { deforestationDisplayFormat } = store.getState();
        return deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE;
      },
      Cell: ({ original }) => {
        const { landmarkHA } = original;
        return renderFormattedDeforestationValueWithIndicator(landmarkHA);
      },
    },

    {
      Header: () => (
        <ColumnsHeader label="Protected Areas" infoBubbleId={infoBubbleConfig.post2020ItOverlap} />
      ),
      className: 'default-cell td-num',
      accessor: 'protectedAreasPercent',
      get show() {
        const { deforestationDisplayFormat } = store.getState();
        return deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE;
      },
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
      get show() {
        const { deforestationDisplayFormat } = store.getState();
        return deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE;
      },
      Cell: ({ original }) => {
        const { protectedAreasHA } = original;
        return renderFormattedDeforestationValueWithIndicator(protectedAreasHA);
      },
    },
  ];
};

// Export the function so it can be called fresh each time
export default getColumnsWithCurrentState;
