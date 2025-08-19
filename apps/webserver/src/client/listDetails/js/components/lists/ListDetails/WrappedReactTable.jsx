import { useTheme, Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';
import ReactTable from 'react-table';
import cloneDeep from 'lodash/cloneDeep';

import columns from '../../../config/columns';
import CustomRow from './CustomRow';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';

const transifex = Transifex.live.translateText;

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
    return getErrorDetails(
      row?.ErrorDetails || getAnalysisError(row?.location_error || row?.analysisError)
    );
  }

  const toggleableColumns = listColumns.map((column) => column.accessor);

  const tableColumns = [...combinedColumns];
  tableColumns.forEach((col) => {
    if (col.accessor === 'checkbox') {
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

    if (errorDetails?.startsWith('The defined ID system')) {
      return errorDetails.split(';')[0];
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
            error={getErrorDetails(
              props.rowInfo?.ErrorDetails ||
                getAnalysisError(props.rowInfo?.location_error || props.rowInfo?.analysisError)
            )}
          >
            {props.children}
          </CustomRow>
        );
      }}
    />
  );
};

export default WrappedReactTable;

const getLocationName = (obj) => obj['Location Name'] || obj.locationName || obj.Location_N;

const errorsMap = {
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
};
