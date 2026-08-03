import { useCallback, useState } from 'react';
import { useTheme, Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';
import ReactTable from 'react-table';
import cloneDeep from 'lodash/cloneDeep';

import columns from '../../../config/columns';
import CustomRow from './CustomRow';
import SortableColumnHeader from '../../columns/SortableColumnHeader';
import SortMenu from '../../columns/SortMenu';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';

const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;

const WrappedReactTable = ({
  listId,
  listView,
  isUserList,
  page,
  listColumns,
  combinedColumns,
  visibleColumns,
  filteredLists,
  numberOfPages,
  tableSortedBy,
  tableSortedDesc,
  getUserLocationData,
  getFilteredGfwListData,
  setSortedBy,
  isGfwList,
  isSharedList,
  viewDiagnostic,
  isDeleteButtonAvailable,
  promptDeleteSelectedLocations,
  copyMoveAction,
  isCopyMoveActionAvailable,
  selectedList,
  setIsLoading,
  currentUser,
}) => {
  const theme = useTheme();

  // GPV-3912: a single sort menu shared by all headers (one MUI Menu per table, not
  // one per column) keeps re-renders cheap on wide tables. It anchors to the captured
  // click position rather than the trigger element, because react-table remounts the
  // header cells on every render — a DOM-node anchor would detach and the menu would
  // jump to the top-left of the page. `sortId` tracks which column's trigger is open.
  const [sortMenu, setSortMenu] = useState({ position: null, sortId: null });

  const openSortMenu = useCallback((event, sortId) => {
    // Stop the header's own click handler from toggling the sort.
    event.stopPropagation();
    const { bottom, left } = event.currentTarget.getBoundingClientRect();
    setSortMenu({ position: { top: bottom, left }, sortId });
  }, []);

  const closeSortMenu = useCallback(() => setSortMenu({ position: null, sortId: null }), []);

  const handleMenuSort = (desc) => {
    const { sortId } = sortMenu;
    setSortMenu({ position: null, sortId: null });
    if (sortId != null) {
      setSortedBy(sortId, desc);
    }
  };

  const setRowProps = (state, rowInfo) => {
    function returnBgColor(id) {
      if (
        rowInfo.original.ErrorDetails ||
        rowInfo.original.location_error ||
        rowInfo.original.analysisError ||
        id === listStatus.Inactive
      ) {
        return theme.palette.error[100];
      }

      return '';
    }

    function returnFgColor(id) {
      if (
        rowInfo.original.ErrorDetails ||
        rowInfo.original.location_error ||
        rowInfo.original.analysisError ||
        id === listStatus.Inactive
      ) {
        return theme.palette.error.main;
      }
      return '';
    }
    return {
      style: {
        backgroundColor: returnBgColor(rowInfo.original?.location_status_id),
        color: returnFgColor(rowInfo.original?.location_status_id),
      },
      rowInfo: rowInfo.original,

      listId,
      isGfwList,
      isSharedList,
    };
  };

  const setHeaderProps = (state) => {
    return {
      onClick: () => {
        gtag('event', 'list table header click', {
          event_category: 'Lists Click',
          event_label: `user sorted lists table ${
            state.sorted.length > 0 ? `by ${state.sorted[0].id}` : ''
          }`,
        });
      },
    };
  };
  function extractRowError(row) {
    let errorDetails;
    try {
      errorDetails =
        row?._original?.ErrorDetails ||
        JSON.parse(row?._original?.location_error || '{}')?.[0] ||
        row?.ErrorDetails ||
        JSON.parse(row?.location_error || '{}')?.[0];
    } catch {
      // ignore JSON parse errors
    }

    if (errorDetails) {
      return getErrorDetails(errorDetails);
    }
    const analysisError = row?._original?.analysisError || row?.analysisError;

    return getErrorDetails(getAnalysisError(analysisError));
  }

  const toggleableColumns = listColumns.map((column) => column.accessor);

  const tableColumns = [...combinedColumns];
  tableColumns.forEach((col) => {
    if (col.accessor === 'checkbox') {
      col.headerClassName = 'sticky-checkbox';

      col.getProps = () => ({
        className: 'sticky-checkbox',
      });

      col.width = 40;
      col.minWidth = 40;
      col.maxWidth = 40;

      return;
    }

    // Only override show property if the column doesn't have its own show logic
    // and it's in the toggleable columns list
    const hasGetter = !!Object.getOwnPropertyDescriptor(col, 'show')?.get;

    if (toggleableColumns.includes(col.accessor) && !hasGetter) {
      col.show = visibleColumns.includes(col.accessor);
    }

    col.defaultSortDesc = true;

    if (col.id === 'Location Name') {
      col.headerClassName = `${col.headerClassName || ''} sticky-location-header`;

      col.getProps = () => ({
        className: 'sticky-location-cell',
      });

      col.width = 220;
      col.minWidth = 180;

      col.Cell = ({ row }) => {
        const error = extractRowError(row);

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{getLocationName(row)}</span>
            {error && (
              <Tooltip title={error} arrow placement="right">
                <Info fontSize="small" sx={{ color: 'text.primary', ml: 1 }} />
              </Tooltip>
            )}
          </div>
        );
      };

      return;
    }

    const max = Math.max(
      ...filteredLists.map((v) =>
        v[col.accessor] ? Math.max(col.accessor.length, v[col.accessor].toString().length) : 0
      )
    );
    if (!col.className) {
      if (max <= 10) {
        col.width = 100;
        col.maxWidth = 100;
      } else {
        col.width = max * 8;
        col.maxWidth = 500;
      }
    }

    // GPV-3912: give each sortable column header a secondary sort control (a dropdown
    // exposing explicit Ascending/Descending options). Header groups (col.columns) and
    // explicitly non-sortable columns keep a plain header.
    //
    // The header is wrapped in place (not on a copy) so the column object keeps a
    // stable identity across renders — otherwise react-table remounts every header/
    // body cell on each render, which both detaches the open menu's anchor and makes
    // sorting expensive. The untouched header is stashed on `_originalHeader` so it can
    // still be introspected elsewhere (getAllColumnNames reads Header().props.label for
    // the alerts view) and so re-renders never wrap an already-wrapped header.
    const isSortableLeaf = !col.columns && col.sortable !== false && !!col.Header;
    if (isSortableLeaf) {
      col._originalHeader = col._originalHeader || col.Header;
      const OriginalHeader = col._originalHeader;
      const sortId = col.id ?? col.accessor;
      col.Header = (headerProps) => (
        <SortableColumnHeader onOpenMenu={(event) => openSortMenu(event, sortId)}>
          {typeof OriginalHeader === 'function' ? OriginalHeader(headerProps) : OriginalHeader}
        </SortableColumnHeader>
      );
    }
  });

  const [REACT_TABLE__LOCATION_NAME] = cloneDeep(columns.react_table__location_name);

  let reactTableOptions = {
    data: filteredLists,
    columns: tableColumns,
    defaultPageSize: 50,
    showPageSizeOptions: false,
    showPagination: true,
    manual: true,
    pages: numberOfPages,
    page,
    previousText: transifex('Previous'),
    nextText: transifex('Next'),
    pageText: transifex('Page'),
    getTheadProps: setHeaderProps,
    // GPV-3912: highlight the column the table is currently sorted by so it's clear
    // which column drives the ordering.
    getTheadThProps: (state, rowInfo, column) => ({
      className: column?.id === tableSortedBy ? 'rt-th--sorted' : undefined,
    }),
    getTrProps: setRowProps,
    pageSizeOptions: [50],
    minRows: 0,
    disableMultiSort: true,
    sorted: [
      {
        id: tableSortedBy,
        desc: tableSortedDesc,
      },
    ],
    defaultSorted: [
      {
        id: REACT_TABLE__LOCATION_NAME.id,
        desc: false,
      },
    ],
  };
  // settings for displaying a paginated user list
  if (isUserList) {
    reactTableOptions = {
      ...reactTableOptions,

      onPageChange: (pageIndex) => {
        getUserLocationData(listId, pageIndex);
      },
      onSortedChange: (newSorted) => {
        setSortedBy(newSorted[0].id, newSorted[0].desc);
      },
    };
  } else {
    reactTableOptions = {
      ...reactTableOptions,

      onPageChange: (pageIndex) => {
        getFilteredGfwListData(listId, pageIndex);
      },
      onSortedChange: (newSorted) => {
        setSortedBy(newSorted[0].id, newSorted[0].desc);
      },
    };
  }

  const getErrorDetails = (errorDetails) => {
    if (!errorDetails) {
      return '';
    }

    if (errorDetails?.startsWith('You have entered an invalid ID')) {
      return errorDetails.split(';')[0];
    } else if (
      errorDetails?.includes('LookUp: did not found lat/long for') ||
      errorDetails?.includes('invalid string format for ID')
    ) {
      return 'You have entered an invalid ID not found in the system’s database, please ensure you have entered the ID value correctly.';
    }

    return errorsMap[errorDetails] || 'Server error';
  };

  const getAnalysisError = (analysisErrorJson) => {
    if (!analysisErrorJson) {
      return '';
    }

    try {
      const [firstError] = JSON.parse(analysisErrorJson);
      return firstError ? 'AnalysisError' : '';
    } catch {
      return '';
    }
  };

  return (
    <>
      <ReactTable
        className={`-highlight notranslate lists-react-table table__${listView}`}
        {...reactTableOptions}
        TrComponent={(props) => {
          return (
            <CustomRow
              isGfwList={isGfwList}
              listId={listId}
              isSharedList={isSharedList}
              rowInfo={props.rowInfo}
              viewDiagnostic={viewDiagnostic}
              isDeleteButtonAvailable={isDeleteButtonAvailable}
              promptDeleteSelectedLocations={promptDeleteSelectedLocations}
              copyMoveAction={copyMoveAction}
              isCopyMoveActionAvailable={isCopyMoveActionAvailable}
              visibleColumns={visibleColumns}
              currentUser={currentUser}
              listView={listView}
              selectedList={selectedList}
              setIsLoading={setIsLoading}
              style={props.style}
            >
              {props.children}
            </CustomRow>
          );
        }}
      />
      <SortMenu
        position={sortMenu.position}
        isSorted={sortMenu.sortId === tableSortedBy}
        isSortedDesc={tableSortedDesc}
        onClose={closeSortMenu}
        onSort={handleMenuSort}
      />
    </>
  );
};

export default WrappedReactTable;

const getLocationName = (obj) => obj['Location Name'] || obj.locationName || obj.Location_N;

export const errorsMap = {
  'Invalid location':
    'This location is not on land. Please ensure your geometry is accurate and in the WGS 84 projection.',
  'Invalid area':
    'This location does not have a valid analysis radius or area defined. Analysis radius (in Km) or analysis area (in Ha) must be defined as a positive integer.',
  'Invalid polygon geometry':
    'This location has invalid geometry. Please make sure all the polygons in your data are closed and have no self-intersections.',
  'Unable to convert point to polygon: At least one of analysisArea or analysisRadius must be valid':
    'No analysis value is defined. Please define either an analysis radius, or an analysis area.',
  'Unable to convert point to polygon: analysisRadius cannot be greater than 3000 km':
    'The defined analysis radius is too big. Valid analysis radius must be smaller than 3000 km.',
  AnalysisError: 'Your location failed analysis due to its size or geometry.',
  NoIntersectionError:
    'Your location either does not meet minimum size requirements or is shaped in a way that does not intersect with a centroid and cannot be analyzed.',
};
