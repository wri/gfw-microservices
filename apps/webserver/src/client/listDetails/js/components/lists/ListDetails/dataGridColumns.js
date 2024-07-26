import React from 'react';

import {
  getValidatedValue,
  checkValid,
  getValue,
  locationIsActive,
  formatDigit,
} from '../../../../../locations/js/utils/locationsTableUtils';
export const dataGridColumns = [
  { field: 'Location Name', headerName: 'Location Name', width: 130 },
  { field: 'Analysis Area', headerName: 'Size (ha)', minWidth: 100 },
  { field: 'Commodity', headerName: 'Commodity', width: 104, minWidth: 100 },
  { field: 'State', headerName: 'State', width: 150 },
  {
    field: 'tree_cover_extent_total',
    headerName: 'Tree Cover Extent (ha)',
    width: 150,
    sortable: false,

    renderCell: ({ row }) => {
      return !locationIsActive(row) ? (
        '--'
      ) : checkValid(row.tree_cover_extent_total) ? (
        <span>{formatDigit(row.tree_cover_extent_total)}</span>
      ) : (
        '--'
      );
    },
  },

  {
    field: 'tree_cover_loss_total_yearly',
    headerName: 'Tree Cover Loss Yearly Total',
    width: 150,
    sortable: false,

    renderCell: ({ row }) => {
      return locationIsActive(row) ? (
        checkValid(row.tree_cover_loss_total_yearly) ? (
          <span>{getValue(row.tree_cover_loss_total_yearly)}</span>
        ) : (
          0
        )
      ) : (
        '--'
      );
    },
  },
  {
    field: 'tree_cover_loss_protected_areas_yearly',
    headerName: 'Tree Cover Loss Yearly Protected Areas',
    width: 150,
    sortable: false,

    renderCell: ({ row }) => {
      return locationIsActive(row) ? (
        checkValid(row.tree_cover_loss_protected_areas_yearly) ? (
          <span>
            {getValidatedValue(
              row.tree_cover_loss_protected_areas_yearly,
              row.protected_areas_area
            )}
          </span>
        ) : (
          0
        )
      ) : (
        '--'
      );
    },
  },
  {
    field: 'tree_cover_loss_primary_forest_yearly',
    headerName: 'Tree Cover Loss Yearly Primary Forest',
    width: 150,
    sortable: false,

    renderCell: ({ row }) => {
      return locationIsActive(row) ? (
        checkValid(row.tree_cover_loss_primary_forest_yearly) ? (
          <span>
            {getValidatedValue(
              row.tree_cover_loss_primary_forest_yearly,
              row.natural_habitat_primary
            )}
          </span>
        ) : (
          0
        )
      ) : (
        '--'
      );
    },
  },
];
