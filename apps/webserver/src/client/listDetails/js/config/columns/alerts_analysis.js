import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import { calculateAndFormatTotalDeforestation } from '../../../../locations/js/utils/locationsTableUtils';
import infoBubbleConfig from '../../../../common/js/constants/info-bubble-config.constants';

const FIELDS_SUBTITLE = 'since last TCL data update';

const roundToTwoDecimals = (num) => (typeof num === 'number' ? num.toFixed(2) : '0');

const alerts_analysis = [
  {
    Header: () => <ColumnsHeader label={columnHeaders.sizeInHa} />,
    className: 'default-cell td-num',
    id: 'total_ha',
    show: true,
    Cell: ({ original }) => {
      const { totalHa } = original;
      const value = typeof totalHa === 'number' ? roundToTwoDecimals(totalHa) : 0;
      return <span title={value}>{value}</span>;
    },
  },
  {
    id: 'intdistAlertsAreaSbtnNaturalForestsTotal',
    Header: () => (
      <ColumnsHeader
        label={columnHeaders.alertsInNaturalForest}
        subtitle={FIELDS_SUBTITLE}
        infoBubbleId={infoBubbleConfig.recentDistAlertsForestNaturalForest}
      />
    ),
    className: 'default-cell td-num',
    show: true,
    Cell: ({ original }) => {
      const { intdistAlertsAreaSbtnNaturalForestsTotal, totalHa } = original;
      const formattedValue = calculateAndFormatTotalDeforestation(
        totalHa,
        JSON.stringify({ sumOfAllNaturalForestsValues: intdistAlertsAreaSbtnNaturalForestsTotal })
      );
      return <span title={intdistAlertsAreaSbtnNaturalForestsTotal}>{formattedValue}</span>;
    },
  },
  {
    id: 'intdistAlertsAreaSbtnNaturalEcosystemTotal',
    Header: () => (
      <ColumnsHeader
        label={columnHeaders.alertsInNonForest}
        subtitle={FIELDS_SUBTITLE}
        infoBubbleId={infoBubbleConfig.recentDistAlertsNonForest}
      />
    ),
    className: 'default-cell td-num',
    show: true,
    Cell: ({ original }) => {
      const { intdistAlertsAreaSbtnNaturalEcosystemTotal, totalHa } = original;
      const formattedValue = calculateAndFormatTotalDeforestation(
        totalHa,
        JSON.stringify({
          sumOfAllNaturalEcosystemValues: intdistAlertsAreaSbtnNaturalEcosystemTotal,
        })
      );
      return <span title={intdistAlertsAreaSbtnNaturalEcosystemTotal}>{formattedValue}</span>;
    },
  },
  {
    id: 'intdistAlertsAreaJrcTotal',
    Header: () => (
      <ColumnsHeader
        label={columnHeaders.alertsInJrc}
        subtitle={FIELDS_SUBTITLE}
        infoBubbleId={infoBubbleConfig.recentDistAlertsForestNaturalForest}
      />
    ),
    className: 'default-cell td-num',
    show: true,
    Cell: ({ original }) => {
      const { intdistAlertsAreaJrcTotal, totalHa } = original;
      const formattedValue = calculateAndFormatTotalDeforestation(
        totalHa,
        JSON.stringify({ sumOfAllJrcValues: intdistAlertsAreaJrcTotal })
      );
      return <span title={intdistAlertsAreaJrcTotal}>{formattedValue}</span>;
    },
  },
  {
    id: 'intdistAlertsAreaAllTotal',
    Header: () => <ColumnsHeader label={columnHeaders.allAlerts} subtitle={FIELDS_SUBTITLE} />,
    className: 'default-cell td-num',
    show: true,
    Cell: ({ original }) => {
      const { intdistAlertsAreaAllTotal, totalHa } = original;
      const formattedValue = calculateAndFormatTotalDeforestation(
        totalHa,
        JSON.stringify({ sumOfAllValues: intdistAlertsAreaAllTotal })
      );
      return <span title={intdistAlertsAreaAllTotal}>{formattedValue}</span>;
    },
  },
];

export default alerts_analysis;
