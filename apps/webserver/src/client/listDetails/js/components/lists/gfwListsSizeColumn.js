import React from 'react';
import { checkValid, formatDigit } from '../../../../locations/js/utils/locationsTableUtils';

const gfwListsSizeColumn = [
  {
    id: 'Size',
    Header: () => (
      <span className="title-text">
        Size <span className="title-text__units">(ha)</span>
      </span>
    ),
    accessor: (d) => {
      return d;
    },
    Cell: (row) => {
      const isValidArea = checkValid(row.original.Size);

      const formattedArea = isValidArea ? formatDigit(row.original.Size) : 0;
      return formattedArea;
    },
    className: 'td-num',
    show: true,
  },
];

export default gfwListsSizeColumn;
