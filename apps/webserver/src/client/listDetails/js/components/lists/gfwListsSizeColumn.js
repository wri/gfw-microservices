import React from 'react';
import { checkValid, formatDigit } from '../../../../locations/js/utils/locationsTableUtils';
import { GFW_LISTS_NUMBER_CONSTANTS } from './../../../../../config/env/gfwLists.constants';

const {
  PROTECTED_AREAS,
  ADMINISTRATIVE_AREAS,
  PALM_OIL_MILLS,
  OIL_PALM_CONCESSIONS,
  RSPO_PALM_CONCESSIONS,
} = GFW_LISTS_NUMBER_CONSTANTS;

const gfwListsSizeColumn = (list_id) => {
  switch (list_id) {
    case PROTECTED_AREAS:
    case ADMINISTRATIVE_AREAS:
    case PALM_OIL_MILLS:
      return [
        {
          id: 'Size',
          Header: () => (
            <span className="title-text">
              Size <span className="title-text__units">(ha)</span>
            </span>
          ),
          accessor: (d) => d,
          Cell: (row) => {
            const isValidArea = checkValid(row.original.total_area);
            const formattedArea = isValidArea ? formatDigit(row.original.total_area) : 0;
            return formattedArea;
          },
          className: 'td-num',
          show: true,
        },
      ];
    case OIL_PALM_CONCESSIONS:
    case RSPO_PALM_CONCESSIONS:
      return [
        {
          id: 'Analysis Area',
          Header: () => (
            <span className="title-text">
              Size <span className="title-text__units">(ha)</span>
            </span>
          ),
          accessor: (d) => d,
          Cell: (row) => {
            const isValidArea = checkValid(row.original?.total_area);
            const formattedArea = isValidArea ? formatDigit(row.original?.total_area) : 0;
            return formattedArea;
          },
          className: 'td-num',
          show: true,
        },
      ];
    default:
      return [];
  }
};

export default gfwListsSizeColumn;
