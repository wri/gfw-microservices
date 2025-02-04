import React from 'react';
import ReactTable from 'react-table';
import cloneDeep from 'lodash/cloneDeep';
import columns from '../../../config/columns';
import CustomRow from './CustomRow';
import store from '../../../../../locations/js/store';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import {
  SBTN_NATURAL_FOREST_LOSS,
  JRC_NATURAL_FOREST_LOSS,
  DISPLAY_FORMAT_PERCENTAGE,
} from './deforestationDisplayFormat.constants';

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
  isEditActionAvailable,
  editList,
  copyMoveAction,
  isCopyMoveActionAvailable,
  selectedList,
  setIsLoading,
  currentUser,
}) => {
  const setRowProps = (state, rowInfo) => {
    // determine row background color based on location status
    function returnBgColor(id) {
      switch (id) {
        case listStatus.Inactive:
          return 'rgba(242, 78, 30, 0.25)';
        default:
          return '';
      }
    }

    // determine row text color based on location status
    function returnFgColor(id) {
      switch (id) {
        case listStatus.Inactive:
          return '#F24E1E';
        default:
          return '';
      }
    }
    return {
      style: {
        backgroundColor: rowInfo?.original && returnBgColor(rowInfo?.original?.location_status_id),
        color: rowInfo?.original && returnFgColor(rowInfo?.original?.location_status_id),
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

  const toggleableColumns = listColumns.map((column) => column.accessor);

  const tableColumns = combinedColumns.slice();
  tableColumns.forEach((col) => {
    if (col.accessor === 'checkbox') {
      return;
    }
    if (toggleableColumns.includes(col.accessor)) {
      col.show = visibleColumns.includes(col.accessor);
    }

    const { naturalForestLossDataSource, deforestationDisplayFormat } = store.getState();
    if (col.accessor === 'natural_land_deforested_area') {
      col.show =
        naturalForestLossDataSource === SBTN_NATURAL_FOREST_LOSS &&
        deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE;
    }

    if (col.accessor === 'naturalForestLossPercent') {
      col.show =
        naturalForestLossDataSource === SBTN_NATURAL_FOREST_LOSS &&
        deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE;
    }

    if (col.accessor === 'jrc_land_deforested_area') {
      col.show =
        naturalForestLossDataSource === JRC_NATURAL_FOREST_LOSS &&
        deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE;
    }
    if (col.accessor === 'jrcNaturalForestLossPercent') {
      col.show =
        naturalForestLossDataSource === JRC_NATURAL_FOREST_LOSS &&
        deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE;
    }

    if (col.accessor === 'protected_areas_area') {
      col.show = deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE;
    }

    if (col.accessor === 'protectedAreasPercent') {
      col.show = deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE;
    }

    if (col.accessor === 'landmark_area') {
      col.show = deforestationDisplayFormat !== DISPLAY_FORMAT_PERCENTAGE;
    }

    if (col.accessor === 'landmarkPercent') {
      col.show = deforestationDisplayFormat === DISPLAY_FORMAT_PERCENTAGE;
    }

    console.log({ col });

    col.defaultSortDesc = true;

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

  return (
    <>
      <div>
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
                isEditActionAvailable={isEditActionAvailable}
                editList={editList}
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
      </div>
    </>
  );
};

export default WrappedReactTable;
