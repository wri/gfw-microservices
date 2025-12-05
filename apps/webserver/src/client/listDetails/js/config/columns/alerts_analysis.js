import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  sortByStatus,
  normalizeColumnData,
  calculateAndFormatTotalDeforestation,
} from '../../../../locations/js/utils/locationsTableUtils';

const transifex = Transifex.live.translateText;

export const alerts_analysis = {
  id: 'totalHa',
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
          totalHa,
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

        const sumOfAllNaturalForestsValues =
          intdistAlertsAreaSbtnNaturalForestsNominalValue +
          intdistAlertsAreaSbtnNaturalForestsHighValue +
          intdistAlertsAreaSbtnNaturalForestsHighestValue;

        const formattedValue = calculateAndFormatTotalDeforestation(
          totalHa,
          JSON.stringify({ sumOfAllNaturalForestsValues })
        );

        return <span title={sumOfAllNaturalForestsValues}>{formattedValue}</span>;
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
          totalHa,
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

        const sumOfAllNaturalEcosystemValues =
          intdistAlertsAreaSbtnNaturalEcosystemNominalValue +
          intdistAlertsAreaSbtnNaturalEcosystemHighValue +
          intdistAlertsAreaSbtnNaturalEcosystemHighestValue;
        const formattedValue = calculateAndFormatTotalDeforestation(
          totalHa,
          JSON.stringify({ sumOfAllNaturalEcosystemValues })
        );
        return <span title={sumOfAllNaturalEcosystemValues}>{formattedValue}</span>;
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
          totalHa,
        } = row.value;
        const intdistAlertsAreaJrcNominalValue =
          typeof intdistAlertsAreaJrcNominal === 'number' ? intdistAlertsAreaJrcNominal : 0;
        const intdistAlertsAreaJrcHighValue =
          typeof intdistAlertsAreaJrcHigh === 'number' ? intdistAlertsAreaJrcHigh : 0;
        const intdistAlertsAreaJrcHighestValue =
          typeof intdistAlertsAreaJrcHighest === 'number' ? intdistAlertsAreaJrcHighest : 0;

        const sumOfAllJrcValues =
          intdistAlertsAreaJrcNominalValue +
          intdistAlertsAreaJrcHighValue +
          intdistAlertsAreaJrcHighestValue;
        const formattedValue = calculateAndFormatTotalDeforestation(
          totalHa,
          JSON.stringify({
            sumOfAllJrcValues,
          })
        );
        return <span title={sumOfAllJrcValues}>{formattedValue}</span>;
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
          totalHa,
        } = row.value;
        const intdistAlertsAreaAllNominalValue =
          typeof intdistAlertsAreaAllNominal === 'number' ? intdistAlertsAreaAllNominal : 0;
        const intdistAlertsAreaAllHighValue =
          typeof intdistAlertsAreaAllHigh === 'number' ? intdistAlertsAreaAllHigh : 0;
        const intdistAlertsAreaAllHighestValue =
          typeof intdistAlertsAreaAllHighest === 'number' ? intdistAlertsAreaAllHighest : 0;

        const sumOfAllValues =
          intdistAlertsAreaAllNominalValue +
          intdistAlertsAreaAllHighValue +
          intdistAlertsAreaAllHighestValue;
        const formattedValue = calculateAndFormatTotalDeforestation(
          totalHa,
          JSON.stringify({ sumOfAllValues })
        );
        return <span title={sumOfAllValues}>{formattedValue}</span>;
      },
    },
  ],
};

const roundToTwoDecimals = (num) => (typeof num === 'number' ? num.toFixed(2) : 0);

export default alerts_analysis;
