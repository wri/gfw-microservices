import InfoBubble from '../../../../common/js/components/InfoBubble';
import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  renderDataIcon,
  renderDataLevelTag,
} from '../../../../locations/js/utils/locationsTableUtils';
import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';

const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;

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
        id: 'commodity_mill_priority_level_parsed',
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
        width: 140,

        Cell: ({ value }) => {
          const level = value?.commodity_mill_priority_level_parsed;
          return renderDataLevelTag(level, value);
        },
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
        id: 'commodity_threat_deforestation_level_parsed',
        Header: () => <ColumnsHeader label={columnHeaders.deforestation} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 140,
        Cell: ({ value }) => {
          const level = value?.commodity_threat_deforestation_level_parsed;
          return renderDataIcon(level, value);
        },
      },
      {
        id: 'commodity_threat_peat_level_parsed',
        Header: () => <ColumnsHeader label={columnHeaders.peat} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 100,
        Cell: ({ value }) => {
          const level = value?.commodity_threat_peat_level_parsed;
          return renderDataIcon(level, value);
        },
      },
      {
        id: 'commodity_threat_protected_areas_level_parsed',
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,

        Cell: ({ value }) => {
          const level = value?.commodity_threat_protected_areas_level_parsed;
          return renderDataIcon(level, value);
        },
      },
      {
        id: 'commodity_threat_fires_level_parsed',
        Header: () => <ColumnsHeader label={columnHeaders.fire} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 80,
        Cell: ({ value }) => {
          const level = value?.commodity_threat_fires_level_parsed;
          return renderDataIcon(level, value);
        },
      },
      {
        id: 'commodity_threat_overall_level_parsed',
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
        width: 160,

        Cell: ({ value }) => {
          const level = value?.commodity_threat_overall_level_parsed;
          return renderDataLevelTag(level, value);
        },
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
        id: 'commodity_value_forest_extent_level_parsed',
        Header: () => <ColumnsHeader label={columnHeaders.forest} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 95,
        Cell: ({ value }) => {
          const level = value?.commodity_value_forest_extent_level_parsed;
          return renderDataIcon(level, value);
        },
      },
      {
        id: 'commodity_value_peat_level_parsed',
        Header: () => <ColumnsHeader label={columnHeaders.peat} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,
        Cell: ({ value }) => {
          const level = value?.commodity_value_peat_level_parsed;
          return renderDataIcon(level, value);
        },
      },
      {
        id: 'commodity_value_protected_areas_level_parsed',
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell',
        show: true,
        width: 90,
        Cell: ({ value }) => {
          const level = value?.commodity_value_protected_areas_level_parsed;
          return renderDataIcon(level, value);
        },
      },
      {
        id: 'commodity_value_overall_level_parsed',
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
        width: 155,

        Cell: ({ value }) => {
          const level = value?.commodity_value_overall_level_parsed;
          return renderDataLevelTag(level, value);
        },
      },
    ],
  },
];

export default commodity_analysis;
