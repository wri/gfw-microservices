import React from 'react';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  checkValid,
  getLastValue,
  sortByStatus,
  normalizeColunmData,
  locationIsActive,
  getColorByLevelClasse,
} from '../../../../locations/js/utils/locationsTableUtils';
import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';
import featureFlags from '../../../../../utils/general.utils';

const { isListDetailsPageRedesignAvailable } = featureFlags;

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
          <InfoBubble infoBubbleId={infoBubbleConfig.threatsAndValues} />
        </span>
      </div>
    ),
    columns: [
      {
        id: 'commodity_mill_priority_level',
        Header: () => (
          <ColumnsHeader
            label={columnHeaders.millPriority}
            infoBubbleId={infoBubbleConfig.palmRiskAssessMillPriority}
          />
        ),
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 110,

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
        sortable: !isListDetailsPageRedesignAvailable,
      },
    ],
  },
  {
    Header: () => (
      <div className="react-table-commodity-risk">
        <span className="title-text" title={transifex(columnHeaders.threats)}>
          {transifex(columnHeaders.threats)} <InfoBubble infoBubbleId={infoBubbleConfig.threats} />
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
        width: 100,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'commodity_threat_peat_level',
        Header: () => <ColumnsHeader label={columnHeaders.peat} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 100,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'commodity_threat_protected_areas_level',
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,

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
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'commodity_threat_fires_level',
        Header: () => <ColumnsHeader label={columnHeaders.fire} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 80,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'commodity_threat_overall_level',
        Header: () => (
          <ColumnsHeader
            label={columnHeaders.overallThreats}
            infoBubbleId={infoBubbleConfig.palmRiskAssessOverallThreats}
          />
        ),
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 95,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
    ],
  },
  {
    Header: () => (
      <div className="react-table-commodity-risk">
        <span className="title-text" title={transifex(columnHeaders.values)}>
          {transifex(columnHeaders.values)} <InfoBubble infoBubbleId={infoBubbleConfig.values} />
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
        width: 95,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'commodity_value_peat_level',
        Header: () => <ColumnsHeader label={columnHeaders.peat} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'commodity_value_protected_areas_level',
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'commodity_value_overall_level',
        Header: () => (
          <ColumnsHeader
            label={columnHeaders.overallValues}
            infoBubbleId={infoBubbleConfig.palmRiskAssessOverallValues}
          />
        ),
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,
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
        sortable: !isListDetailsPageRedesignAvailable,
      },
    ],
  },
];

export default commodity_analysis;
