import React from 'react';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import { columnHeaders } from './columnHeaders.constants';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  checkValid,
  formatDigit,
  getValue,
  getValidatedValue,
  sortByStatus,
  normalizeColunmData,
  locationIsActive,
  calculateAndFormatTotalDeforestation,
} from '../../../../locations/js/utils/locationsTableUtils';
import featureFlags from '../../../../../utils/general.utils';
import infoBubbleConfig from '../../../../common/js/infoBubbleConfig.constants';

const { isListDetailsPageRedesignAvailable } = featureFlags;
const transifex = Transifex.live.translateText;

const forest_change_analysis = [
  {
    id: 'tree_cover_extent_total',
    Header: () => (
      <span>
        <span className="title-text" title={transifex(columnHeaders.treeCoverExtentInHa)}>
          {transifex(columnHeaders.treeCoverExtent)} <span className="title-text__units">(ha)</span>
        </span>
      </span>
    ),
    accessor: (d) => {
      return d;
    },
    className: 'default-cell td-num',
    show: true,
    width: 100,
    maxWidth: 115,
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

    sortable: !isListDetailsPageRedesignAvailable,
  },
  {
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
        Header: () => <ColumnsHeader label={columnHeaders.total} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell td-num',
        show: true,
        Cell: (row) => {
          const { tree_cover_loss_total_yearly, tree_cover_extent_total } = row.value;

          if (
            !locationIsActive(row.value) ||
            (!checkValid(tree_cover_loss_total_yearly) && !isListDetailsPageRedesignAvailable)
          ) {
            return '0%';
          }

          const value = getValue(tree_cover_loss_total_yearly);
          const formattedValue = isListDetailsPageRedesignAvailable
            ? calculateAndFormatTotalDeforestation(
                tree_cover_extent_total,
                tree_cover_loss_total_yearly
              )
            : value;

          return <span title={value}>{formattedValue}</span>;
        },
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.tree_cover_loss_total_yearly) -
              normalizeColunmData(b.tree_cover_loss_total_yearly)
            );
          }

          return sortStatus;
        },
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'tree_cover_loss_protected_areas_yearly',
        Header: () => <ColumnsHeader label={columnHeaders.protectedAreas} />,
        accessor: (d) => {
          return d;
        },
        className: 'default-cell td-num',
        show: true,
        Cell: (row) => {
          const {
            tree_cover_loss_protected_areas_yearly,
            protected_areas_area,
            tree_cover_extent_total,
          } = row.value;

          if (
            !locationIsActive(row.value) ||
            (!checkValid(tree_cover_loss_protected_areas_yearly) &&
              !isListDetailsPageRedesignAvailable)
          ) {
            return '0%';
          }

          const validatedValue = getValidatedValue(
            tree_cover_loss_protected_areas_yearly,
            protected_areas_area
          );
          const formattedValue = isListDetailsPageRedesignAvailable
            ? calculateAndFormatTotalDeforestation(
                tree_cover_extent_total,
                tree_cover_loss_protected_areas_yearly,
                protected_areas_area
              )
            : validatedValue;

          return <span title={validatedValue}>{formattedValue}</span>;
        },
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.tree_cover_loss_protected_areas_yearly) -
              normalizeColunmData(b.tree_cover_loss_protected_areas_yearly)
            );
          }

          return sortStatus;
        },
        sortable: !isListDetailsPageRedesignAvailable,
      },
      {
        id: 'tree_cover_loss_primary_forest_yearly',
        Header: () => <ColumnsHeader label={columnHeaders.primaryForest} />,
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

          if (
            !locationIsActive(row.value) ||
            (!checkValid(tree_cover_loss_primary_forest_yearly) &&
              !isListDetailsPageRedesignAvailable)
          ) {
            return '0%';
          }

          const validatedValue = getValidatedValue(
            tree_cover_loss_primary_forest_yearly,
            natural_habitat_primary
          );
          const formattedValue = isListDetailsPageRedesignAvailable
            ? calculateAndFormatTotalDeforestation(
                tree_cover_extent_total,
                tree_cover_loss_primary_forest_yearly,
                natural_habitat_primary
              )
            : validatedValue;

          return <span title={validatedValue}>{formattedValue}</span>;
        },
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if (sortStatus == 2) {
            return (
              normalizeColunmData(a.tree_cover_loss_primary_forest_yearly) -
              normalizeColunmData(b.tree_cover_loss_primary_forest_yearly)
            );
          }

          return sortStatus;
        },
        sortable: !isListDetailsPageRedesignAvailable,
      },
    ],
  },
];

export default forest_change_analysis;
