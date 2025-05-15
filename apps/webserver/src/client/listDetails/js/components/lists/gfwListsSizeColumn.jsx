import { checkValid, formatDigit } from '../../../../locations/js/utils/locationsTableUtils';
import { GFW_LISTS_NUMBER_CONSTANTS } from '../../../../../config/env/gfwLists.constants';

// Extract the numerical values of types of GFW_LISTS from the constant, and place them in set.
const gfwListsTypesIdNumericValues = new Set(Object.values(GFW_LISTS_NUMBER_CONSTANTS));

const sizeHeader = () => (
  <span className="title-text">
    Size <span className="title-text__units">(ha)</span>
  </span>
);

const sizeAccessor = (d) => d;

const sizeCell = (row) => {
  const isValidArea = checkValid(row.original.total_area);
  return isValidArea ? formatDigit(row.original.total_area) : 0;
};

const gfwListsSizeColumn = (listId) => {
  if (gfwListsTypesIdNumericValues.has(listId)) {
    return [
      {
        id: 'Size',
        Header: sizeHeader,
        accessor: sizeAccessor,
        Cell: sizeCell,
        className: 'td-num',
        show: true,
      },
    ];
  }

  return [];
};

export default gfwListsSizeColumn;
