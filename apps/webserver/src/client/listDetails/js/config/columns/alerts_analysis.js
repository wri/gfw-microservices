import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  sortByStatus,
  normalizeColumnData,
} from '../../../../locations/js/utils/locationsTableUtils';

const transifex = Transifex.live.translateText;

export const alerts_analysis = {
  Header: () => (
    <div className="react-table-tree-cover-loss">
      <span className="title-text" title={transifex(columnHeaders.treeCoverLossInHa)}>
        {transifex(columnHeaders.treeCoverLoss)} <span className="title-text__units">(ha)</span>
      </span>
    </div>
  ),
  columns: [
    {
      id: 'tree_cover_loss_total_yearly',
      Header: () => <ColumnsHeader label={columnHeaders.sizeInHa} />,
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        const { totalHa } = row.value;
        const value = typeof totalHa === 'number' ? roundToTwoDecimals(totalHa) : 0;
        return <span title={value}>{value}</span>;
      },
    },
    {
      id: 'tree_cover_extent_total',
      Header: () => <ColumnsHeader label={columnHeaders.alertsInNaturalForest} />,
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        const {
          intdistAlertsAreaSbtnNaturalForestsNominal,
          intdistAlertsAreaSbtnNaturalForestsHigh,
          intdistAlertsAreaSbtnNaturalForestsHighest,
        } = row.value;
        const intdistAlertsAreaSbtnNaturalForestsNominalValue =
          typeof intdistAlertsAreaSbtnNaturalForestsNominal === 'number'
            ? intdistAlertsAreaSbtnNaturalForestsNominal
            : 0;
        const intdistAlertsAreaSbtnNaturalForestsHighValue =
          typeof intdistAlertsAreaSbtnNaturalForestsHigh === 'number'
            ? intdistAlertsAreaSbtnNaturalForestsHigh
            : 0;
        const intdistAlertsAreaSbtnNaturalForestsHighestValue =
          typeof intdistAlertsAreaSbtnNaturalForestsHighest === 'number'
            ? intdistAlertsAreaSbtnNaturalForestsHighest
            : 0;

        const totalHa =
          intdistAlertsAreaSbtnNaturalForestsNominalValue +
          intdistAlertsAreaSbtnNaturalForestsHighValue +
          intdistAlertsAreaSbtnNaturalForestsHighestValue;
        const value = roundToTwoDecimals(totalHa);
        return <span title={value}>{value}</span>;
      },
    },
    {
      id: 'tree_cover_loss_total_yearly',
      Header: () => <ColumnsHeader label={columnHeaders.alertsInNonForest} />,
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        const {
          intdistAlertsAreaSbtnNaturalEcosystemNominal,
          intdistAlertsAreaSbtnNaturalEcosystemHigh,
          intdistAlertsAreaSbtnNaturalEcosystemHighest,
        } = row.value;
        const intdistAlertsAreaSbtnNaturalEcosystemNominalValue =
          typeof intdistAlertsAreaSbtnNaturalEcosystemNominal === 'number'
            ? intdistAlertsAreaSbtnNaturalEcosystemNominal
            : 0;
        const intdistAlertsAreaSbtnNaturalEcosystemHighValue =
          typeof intdistAlertsAreaSbtnNaturalEcosystemHigh === 'number'
            ? intdistAlertsAreaSbtnNaturalEcosystemHigh
            : 0;
        const intdistAlertsAreaSbtnNaturalEcosystemHighestValue =
          typeof intdistAlertsAreaSbtnNaturalEcosystemHighest === 'number'
            ? intdistAlertsAreaSbtnNaturalEcosystemHighest
            : 0;

        const totalHa =
          intdistAlertsAreaSbtnNaturalEcosystemNominalValue +
          intdistAlertsAreaSbtnNaturalEcosystemHighValue +
          intdistAlertsAreaSbtnNaturalEcosystemHighestValue;
        const value = roundToTwoDecimals(totalHa);
        return <span title={value}>{value}</span>;
      },
    },
    {
      id: 'tree_cover_loss_total_yearly',
      Header: () => <ColumnsHeader label={columnHeaders.alertsInJrc} />,
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        const {
          intdistAlertsAreaJrcNominal,
          intdistAlertsAreaJrcHigh,
          intdistAlertsAreaJrcHighest,
        } = row.value;
        const intdistAlertsAreaJrcNominalValue =
          typeof intdistAlertsAreaJrcNominal === 'number' ? intdistAlertsAreaJrcNominal : 0;
        const intdistAlertsAreaJrcHighValue =
          typeof intdistAlertsAreaJrcHigh === 'number' ? intdistAlertsAreaJrcHigh : 0;
        const intdistAlertsAreaJrcHighestValue =
          typeof intdistAlertsAreaJrcHighest === 'number' ? intdistAlertsAreaJrcHighest : 0;

        const totalHa =
          intdistAlertsAreaJrcNominalValue +
          intdistAlertsAreaJrcHighValue +
          intdistAlertsAreaJrcHighestValue;
        const value = roundToTwoDecimals(totalHa);
        return <span title={value}>{value}</span>;
      },
      sortMethod: (a, b) => {
        const sortStatus = sortByStatus(a, b);
        if (sortStatus == 2) {
          return (
            normalizeColumnData(a.tree_cover_loss_total_yearly) -
            normalizeColumnData(b.tree_cover_loss_total_yearly)
          );
        }

        return sortStatus;
      },
    },
    {
      id: 'tree_cover_loss_primary_forest_yearly',
      Header: () => <ColumnsHeader label={columnHeaders.allAlerts} />,
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        const {
          intdistAlertsAreaAllNominal,
          intdistAlertsAreaAllHigh,
          intdistAlertsAreaAllHighest,
        } = row.value;
        const intdistAlertsAreaAllNominalValue =
          typeof intdistAlertsAreaAllNominal === 'number' ? intdistAlertsAreaAllNominal : 0;
        const intdistAlertsAreaAllHighValue =
          typeof intdistAlertsAreaAllHigh === 'number' ? intdistAlertsAreaAllHigh : 0;
        const intdistAlertsAreaAllHighestValue =
          typeof intdistAlertsAreaAllHighest === 'number' ? intdistAlertsAreaAllHighest : 0;

        const totalHa =
          intdistAlertsAreaAllNominalValue +
          intdistAlertsAreaAllHighValue +
          intdistAlertsAreaAllHighestValue;
        const value = roundToTwoDecimals(totalHa);
        return <span title={value}>{value}</span>;
      },
    },
  ],
};

const roundToTwoDecimals = (num) => (typeof num === 'number' ? num.toFixed(2) : 0);

export default alerts_analysis;
