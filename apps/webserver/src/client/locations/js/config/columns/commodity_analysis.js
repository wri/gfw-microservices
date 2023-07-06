import React from 'react';
import IconButtonWrapper from '../../components/IconButtonWrapper';
import { columnHeaders, locationsPage } from '../../../../common/js/config';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  checkValid,
  getLastValue,
  sortByStatus,
  normalizeColunmData,
  locationIsActive,
  getColorByLevelClasse,
} from '../../utils/locationsTableUtils';

const transifex = Transifex.live.translateText;

const getListIconClasse = (level) => {
  return `list-icons-container list-icons-container--${getColorByLevelClasse[getLastValue(level)]}`;
};

const getAnalysisTextClasse = (level) => {
  return `list-analysis-text list-analysis-text--${
    getColorByLevelClasse[getLastValue(level)] || 'red'
  }`;
};

const getAnalysisText = {
  0: transifex(columnHeaders.low),
  1: transifex(columnHeaders.mediumAbbr),
  2: transifex(columnHeaders.high),
};

const renderAnalysisIcon = (level) => {
  return checkValid(level) ? (
    <div className={getListIconClasse(level)}>
      <svg className="list-icons">
        <use className="analysis-header-click" xlinkHref="#circle-list" />
      </svg>
    </div>
  ) : (
    '--'
  );
};

const commodity_analysis = [
  {
    Header: () => (
      <div className="react-table-commodity-risk">
        <span className="title-text" title={transifex(columnHeaders.threatsAndValues)}>
          {transifex(columnHeaders.threatsAndValuesAbbr)}{' '}
          <IconButtonWrapper id={locationsPage.infoBubbleConfig.threatsAndValues} />
        </span>
      </div>
    ),
    columns: [
      {
        id: 'commodity_mill_priority_level',
        Header: () => <ColumnsHeader label={columnHeaders.millPriority} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,
        maxWidth: 90,

        Cell: (row) =>
          !locationIsActive(row.value) ? (
            '--'
          ) : checkValid(row.value.commodity_mill_priority_level) ? (
            <div className={getAnalysisTextClasse(row.value.commodity_mill_priority_level)}>
              {getAnalysisText[getLastValue(row.value.commodity_mill_priority_level)] ||
                transifex(columnHeaders.high)}
            </div>
          ) : (
            '--'
          ),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              getLastValue(a.commodity_mill_priority_level) -
              getLastValue(b.commodity_mill_priority_level)
            );
          }

          return sortStatus;
        },
      },
    ],
  },
  {
    Header: () => (
      <div className="react-table-commodity-risk">
        <span className="title-text" title={transifex(columnHeaders.threats)}>
          {transifex(columnHeaders.threats)}{' '}
          <IconButtonWrapper id={locationsPage.infoBubbleConfig.threats} />
        </span>
      </div>
    ),
    columns: [
      {
        id: 'commodity_threat_deforestation_level',
        Header: () => <ColumnsHeader label={columnHeaders.deforestation} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value)
            ? '--'
            : renderAnalysisIcon(row.value.commodity_threat_deforestation_level),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              getLastValue(a.commodity_threat_deforestation_level) -
              getLastValue(b.commodity_threat_deforestation_level)
            );
          }

          return sortStatus;
        },
      },
      {
        id: 'commodity_threat_peat_level',
        Header: () => <ColumnsHeader label={columnHeaders.peat} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value)
            ? '--'
            : renderAnalysisIcon(row.value.commodity_threat_peat_level),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              getLastValue(a.commodity_threat_peat_level) -
              getLastValue(b.commodity_threat_peat_level)
            );
          }

          return sortStatus;
        },
      },
      {
        id: 'commodity_threat_protected_areas_level',
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value)
            ? '--'
            : renderAnalysisIcon(row.value.commodity_threat_protected_areas_level),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              getLastValue(a.commodity_threat_protected_areas_level) -
              getLastValue(b.commodity_threat_protected_areas_level)
            );
          }
          return sortStatus;
        },
      },
      {
        id: 'commodity_threat_fires_level',
        Header: () => <ColumnsHeader label={columnHeaders.fire} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 60,
        maxWidth: 60,
        Cell: (row) =>
          !locationIsActive(row.value)
            ? '--'
            : renderAnalysisIcon(row.value.commodity_threat_fires_level),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              getLastValue(a.commodity_threat_fires_level) -
              getLastValue(b.commodity_threat_fires_level)
            );
          }

          return sortStatus;
        },
      },
      {
        id: 'commodity_threat_overall_level',
        Header: () => <ColumnsHeader label={columnHeaders.overall} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value) ? (
            '--'
          ) : checkValid(row.value.commodity_threat_overall_level) ? (
            <div className={getAnalysisTextClasse(row.value.commodity_threat_overall_level)}>
              {getAnalysisText[getLastValue(row.value.commodity_threat_overall_level)] ||
                transifex(columnHeaders.high)}
            </div>
          ) : (
            '--'
          ),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.commodity_threat_overall_level) -
              normalizeColunmData(b.commodity_threat_overall_level)
            );
          }

          return sortStatus;
        },
      },
    ],
  },
  {
    Header: () => (
      <div className="react-table-commodity-risk">
        <span className="title-text" title={transifex(columnHeaders.values)}>
          {transifex(columnHeaders.values)}{' '}
          <IconButtonWrapper id={locationsPage.infoBubbleConfig.values} />
        </span>
      </div>
    ),
    columns: [
      {
        id: 'commodity_value_forest_extent_level',
        Header: () => <ColumnsHeader label={columnHeaders.forest} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value)
            ? '--'
            : renderAnalysisIcon(row.value.commodity_value_forest_extent_level),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.commodity_value_forest_extent_level) -
              normalizeColunmData(b.commodity_value_forest_extent_level)
            );
          }

          return sortStatus;
        },
      },
      {
        id: 'commodity_value_peat_level',
        Header: () => <ColumnsHeader label={columnHeaders.peat} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value)
            ? '--'
            : renderAnalysisIcon(row.value.commodity_value_peat_level),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.commodity_value_peat_level) -
              normalizeColunmData(b.commodity_value_peat_level)
            );
          }

          return sortStatus;
        },
      },
      {
        id: 'commodity_value_protected_areas_level',
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value)
            ? '--'
            : renderAnalysisIcon(row.value.commodity_value_protected_areas_level),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.commodity_value_protected_areas_level) -
              normalizeColunmData(b.commodity_value_protected_areas_level)
            );
          }

          return sortStatus;
        },
      },
      {
        id: 'commodity_value_overall_level',
        Header: () => <ColumnsHeader label={columnHeaders.overall} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 75,
        maxWidth: 75,
        Cell: (row) =>
          !locationIsActive(row.value) ? (
            '--'
          ) : checkValid(row.value.commodity_value_overall_level) ? (
            <div className={getAnalysisTextClasse(row.value.commodity_value_overall_level)}>
              {getAnalysisText[getLastValue(row.value.commodity_value_overall_level)] ||
                transifex(columnHeaders.high)}
            </div>
          ) : (
            '--'
          ),
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.commodity_value_overall_level) -
              normalizeColunmData(b.commodity_value_overall_level)
            );
          }
        },
      },
    ],
  },
];

export default commodity_analysis;
