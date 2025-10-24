import InfoBubble from '../../../../common/js/components/InfoBubble';
import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  checkValid,
  formatDigit,
  getValue,
  getValidatedValue,
  sortByStatus,
  normalizeColumnData,
  locationIsActive,
  calculateAndFormatTotalDeforestation,
} from '../../../../locations/js/utils/locationsTableUtils';
import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';

const transifex = Transifex.live.translateText;

export const alerts_analysis = {
  Header: () => (
    <div className="react-table-tree-cover-loss">
      <span className="title-text" title={transifex(columnHeaders.treeCoverLossInHa)}>
        {transifex(columnHeaders.treeCoverLoss)} <span className="title-text__units">(ha)</span>
        <InfoBubble infoBubbleId={infoBubbleConfig.lossAllYears} />
      </span>
    </div>
  ),
  columns: [
    {
      id: 'tree_cover_loss_total_yearly',
      Header: () => (
        <ColumnsHeader
          label={columnHeaders.sizeInHa}
          infoBubbleId={infoBubbleConfig.post2000TreeCoverLoss}
        />
      ),
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: () => {
        return <span>#</span>;
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
      sortable: false,
    },
    {
      id: 'tree_cover_extent_total',
      Header: () => (
        <ColumnsHeader
          label={columnHeaders.alertsInNaturalForest}
          infoBubbleId={infoBubbleConfig.post2000TreeCover}
        />
      ),
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        return locationIsActive(row.value) && checkValid(row.value.tree_cover_extent_total) ? (
          <span title={formatDigit(row.value.tree_cover_extent_total)}>
            {formatDigit(row.value.tree_cover_extent_total)}
          </span>
        ) : (
          '0%'
        );
      },

      sortMethod: (a, b) => {
        const sortStatus = sortByStatus(a, b);
        if (sortStatus == 2) {
          return a.tree_cover_extent_total - b.tree_cover_extent_total;
        }

        return sortStatus;
      },

      sortable: false,
    },
    {
      id: 'tree_cover_loss_total_yearly',
      Header: () => (
        <ColumnsHeader
          label={columnHeaders.alertsInNonForest}
          infoBubbleId={infoBubbleConfig.post2000TreeCoverLoss}
        />
      ),
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        const { tree_cover_loss_total_yearly, tree_cover_extent_total } = row.value;

        const value = getValue(tree_cover_loss_total_yearly);
        const formattedValue = calculateAndFormatTotalDeforestation(
          tree_cover_extent_total,
          tree_cover_loss_total_yearly
        );

        return <span title={value}>{formattedValue}</span>;
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
      sortable: false,
    },
    {
      id: 'tree_cover_loss_primary_forest_yearly',
      Header: () => (
        <ColumnsHeader
          label={columnHeaders.allAlerts}
          infoBubbleId={infoBubbleConfig.post2000PrimaryForest}
        />
      ),
      accessor: (d) => {
        return d;
      },
      className: 'default-cell td-num',
      show: true,
      Cell: (row) => {
        const {
          tree_cover_loss_primary_forest_yearly,
          natural_habitat_primary,
          tree_cover_extent_total,
        } = row.value;

        const validatedValue = getValidatedValue(
          tree_cover_loss_primary_forest_yearly,
          natural_habitat_primary
        );
        const formattedValue = calculateAndFormatTotalDeforestation(
          tree_cover_extent_total,
          tree_cover_loss_primary_forest_yearly,
          natural_habitat_primary
        );

        return <span title={validatedValue}>{formattedValue}</span>;
      },
      sortMethod: (a, b) => {
        const sortStatus = sortByStatus(a, b);
        if (sortStatus == 2) {
          return (
            normalizeColumnData(a.tree_cover_loss_primary_forest_yearly) -
            normalizeColumnData(b.tree_cover_loss_primary_forest_yearly)
          );
        }

        return sortStatus;
      },
      sortable: false,
    },
  ],
};

export default alerts_analysis;
