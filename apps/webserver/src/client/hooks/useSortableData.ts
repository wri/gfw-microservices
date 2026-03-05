import { useState, useMemo, useCallback } from 'react';

/**
 * Sort direction type
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Options for configuring the sortable data hook
 */
export interface UseSortableDataOptions {
  /**
   * Initial column to sort by
   * @default ''
   */
  defaultOrderBy?: string;
  /**
   * Initial sort direction
   * @default 'asc'
   */
  defaultOrder?: SortOrder;
  /**
   * List of column keys that should be treated as numeric values
   * @default []
   */
  numericColumns?: string[];
}

/**
 * Return type for the useSortableData hook
 */
export interface UseSortableDataReturn<T> {
  /**
   * The sorted data array
   */
  sortedData: T[];
  /**
   * Current column being sorted by
   */
  orderBy: string;
  /**
   * Current sort direction
   */
  order: SortOrder;
  /**
   * Function to handle column sort
   */
  handleSort: (column: string) => void;
  /**
   * Helper to check if a column is currently sorted
   */
  isSorted: (column: string) => boolean;
  /**
   * Helper to get the sort direction for a column
   */
  getSortDirection: (column: string) => SortOrder | null;
}

/**
 * Custom hook for sortable table data with TypeScript support
 *
 * @template T - The type of data objects in the array
 * @param data - The data array to sort
 * @param options - Configuration options
 * @returns Sorted data and sort controls
 *
 * @example
 * ```typescript
 * const { sortedData, handleSort, orderBy, order } = useSortableData(myData, {
 *   defaultOrderBy: 'name',
 *   defaultOrder: 'asc',
 *   numericColumns: ['age', 'price']
 * });
 * ```
 */
export function useSortableData<T extends Record<string, any>>(
  data: T[] | null | undefined,
  options: UseSortableDataOptions = {}
): UseSortableDataReturn<T> {
  const { defaultOrderBy = '', defaultOrder = 'asc', numericColumns = [] } = options;

  const [orderBy, setOrderBy] = useState<string>(defaultOrderBy);
  const [order, setOrder] = useState<SortOrder>(defaultOrder);

  const handleSort = useCallback(
    (column: string): void => {
      if (orderBy === column) {
        setOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
      } else {
        setOrderBy(column);
        setOrder('asc');
      }
    },
    [orderBy]
  );

  const sortedData = useMemo((): T[] => {
    if (!data || data.length === 0) {
      return [];
    }

    return [...data].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      // Parse numeric columns
      if (numericColumns.includes(orderBy)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // Handle string comparison
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
          bValue = bValue.toLowerCase();
        }
      }

      // Compare values
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, orderBy, order, numericColumns]);

  const isSorted = useCallback((column: string): boolean => orderBy === column, [orderBy]);

  const getSortDirection = useCallback(
    (column: string): SortOrder | null => (orderBy === column ? order : null),
    [orderBy, order]
  );

  return {
    sortedData,
    orderBy,
    order,
    handleSort,
    isSorted,
    getSortDirection,
  };
}