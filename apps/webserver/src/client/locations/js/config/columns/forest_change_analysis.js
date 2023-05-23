import React from 'react';
import IconButtonWrapper from '../../components/IconButtonWrapper';
import { columnHeaders, locationsPage } from '../../../../common/js/config';
import ColumnsHeader from '../../components/columns/ColumnsHeader';
import {
  checkValid,
  formatDigit,
  getValue,
  getValidatedValue,
  sortByStatus,
  normalizeColunmData,
  locationIsActive,
} from '../../utils/locationsTableUtils';

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
      return !locationIsActive(row.value) ? (
        '--'
      ) : checkValid(row.value.tree_cover_extent_total) ? (
        <span title={formatDigit(row.value.tree_cover_extent_total)}>
          {formatDigit(row.value.tree_cover_extent_total)}
        </span>
      ) : (
        '--'
      );
    },
    sortMethod: (a, b) => {
      const sortStatus = sortByStatus(a, b);
      if(sortStatus == 'active') {
        return a.tree_cover_extent_total - b.tree_cover_extent_total;
      }
          
      return sortStatus;
    },
  },
  {
    Header: () => (
      <div className="react-table-tree-cover-loss">
        <span className="title-text" title={transifex(columnHeaders.treeCoverLossInHa)}>
          {transifex(columnHeaders.treeCoverLoss)} <span className="title-text__units">(ha)</span>
          <IconButtonWrapper id={locationsPage.infoBubbleConfig.lossAllYears} />
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
          return locationIsActive(row.value) ? (
            checkValid(row.value.tree_cover_loss_total_yearly) ? (
              <span title={getValue(row.value.tree_cover_loss_total_yearly)}>
                {getValue(row.value.tree_cover_loss_total_yearly)}
              </span>
            ) : (
              0
            )
          ) : (
            '--'
          );
        },
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if(sortStatus == 'active') {
            return normalizeColunmData(a.tree_cover_loss_total_yearly) - normalizeColunmData(b.tree_cover_loss_total_yearly);
          }
            
          return sortStatus
        },
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
          return locationIsActive(row.value) ? (
            checkValid(row.value.tree_cover_loss_protected_areas_yearly) ? (
              <span
                title={getValidatedValue(
                  row.value.tree_cover_loss_protected_areas_yearly,
                  row.value.protected_areas_area
                )}
              >
                {getValidatedValue(row.value.tree_cover_loss_protected_areas_yearly, row.value.protected_areas_area)}
              </span>
            ) : (
              0
            )
          ) : (
            '--'
          );
        },
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if(sortStatus == 'active') {
            return normalizeColunmData(a.tree_cover_loss_protected_areas_yearly) - normalizeColunmData(b.tree_cover_loss_protected_areas_yearly);
          }
            
          return sortStatus;
        },
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
          return locationIsActive(row.value) ? (
            checkValid(row.value.tree_cover_loss_primary_forest_yearly) ? (
              <span
                title={getValidatedValue(
                  row.value.tree_cover_loss_primary_forest_yearly,
                  row.value.natural_habitat_primary
                )}
              >
                {getValidatedValue(
                  row.value.tree_cover_loss_primary_forest_yearly,
                  row.value.natural_habitat_primary
                )}
              </span>
            ) : (
              0
            )
          ) : (
            '--'
          );
        },
        sortMethod: (a, b) => {
          const sortStatus = sortByStatus(a, b);
          if(sortStatus == 'active') {
            return  normalizeColunmData(a.tree_cover_loss_primary_forest_yearly) - normalizeColunmData(b.tree_cover_loss_primary_forest_yearly);
          }

          return sortStatus;
        },
      },
    ],
  },
];

export default forest_change_analysis;
