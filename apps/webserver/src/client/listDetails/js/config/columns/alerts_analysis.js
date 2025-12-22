import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  sortByStatus,
  normalizeColumnData,
  calculateAndFormatTotalDeforestation,
} from '../../../../locations/js/utils/locationsTableUtils';

const transifex = Transifex.live.translateText;

const FIELDS_SUBTITLE = 'since last TCL data update';

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
      id: 'intdistAlertsAreaSbtnNaturalForests',
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
      id: 'alerts_in_natural_forest',
      Header: () => (
        <ColumnsHeader label={columnHeaders.alertsInNaturalForest} subtitle={FIELDS_SUBTITLE} />
      ),
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
        const intdistAlertsAreaSbtnNaturalForestsNominalValue = getNumericValue(
          intdistAlertsAreaSbtnNaturalForestsNominal
        );
        const intdistAlertsAreaSbtnNaturalForestsHighValue = getNumericValue(
          intdistAlertsAreaSbtnNaturalForestsHigh
        );
        const intdistAlertsAreaSbtnNaturalForestsHighestValue = getNumericValue(
          intdistAlertsAreaSbtnNaturalForestsHighest
        );

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
      id: 'alerts_in_non_forest',
      Header: () => (
        <ColumnsHeader label={columnHeaders.alertsInNonForest} subtitle={FIELDS_SUBTITLE} />
      ),
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
        const intdistAlertsAreaSbtnNaturalEcosystemNominalValue = getNumericValue(
          intdistAlertsAreaSbtnNaturalEcosystemNominal
        );
        const intdistAlertsAreaSbtnNaturalEcosystemHighValue = getNumericValue(
          intdistAlertsAreaSbtnNaturalEcosystemHigh
        );
        const intdistAlertsAreaSbtnNaturalEcosystemHighestValue = getNumericValue(
          intdistAlertsAreaSbtnNaturalEcosystemHighest
        );

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
      id: 'alerts_in_jrc',
      Header: () => <ColumnsHeader label={columnHeaders.alertsInJrc} subtitle={FIELDS_SUBTITLE} />,
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
        const intdistAlertsAreaJrcNominalValue = getNumericValue(intdistAlertsAreaJrcNominal);
        const intdistAlertsAreaJrcHighValue = getNumericValue(intdistAlertsAreaJrcHigh);
        const intdistAlertsAreaJrcHighestValue = getNumericValue(intdistAlertsAreaJrcHighest);

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
      id: 'alerts_in_all',
      Header: () => <ColumnsHeader label={columnHeaders.allAlerts} subtitle={FIELDS_SUBTITLE} />,
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
        const intdistAlertsAreaAllNominalValue = getNumericValue(intdistAlertsAreaAllNominal);
        const intdistAlertsAreaAllHighValue = getNumericValue(intdistAlertsAreaAllHigh);
        const intdistAlertsAreaAllHighestValue = getNumericValue(intdistAlertsAreaAllHighest);

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

const roundToTwoDecimals = (num) => (typeof num === 'number' ? num.toFixed(2) : '0');

const getNumericValue = (value) => (typeof value === 'number' ? value : 0);

export default alerts_analysis;
