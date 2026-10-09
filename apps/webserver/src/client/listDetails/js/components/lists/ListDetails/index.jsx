import { Component } from 'react';
import isEqual from 'lodash/isEqual';
import {
  Typography,
  Grid,
  Button as MaterialButton,
  Stack,
  Paper,
  Box,
  Alert,
  Checkbox,
  Snackbar,
} from '@mui/material';
import axios from 'axios';
import errorLogger from '../../../../../common/js/utils/errorLogger';
import { PillButton } from '../../../../../components';
import GDPRFooter from 'common/js/components/GDPRFooter/index';
import { ArrowBack, NotListedLocation, QueryStats, Download } from '@mui/icons-material';
import CustomDialog from 'common/js/components/CustomDialog/CustomDialog';
import { maxLocations } from 'locations/js/utils/upload.utils';
import { Link } from '../../../../../components';
import ModalLoader from 'common/js/components/Loaders/ModalLoader';
import AnalysesTabs from './AnalysesTabs';
import getUserLocationDataFromAPI from '../getUserLocationDataFromAPI';
import filterListData from '../filterListData';
import Filter from './Filter';
import { saveGfwListLocations } from '../../../utils/moveLocations';
import store from '../../../../../locations/js/store';
import { locationsPage, userAccessLevel } from '../../../../../common/js/config';
import {
  changeListView,
  clearFilters,
  setFilterCount,
  toggleCanopyModal,
  updateFilteredData,
  updateFilters,
  updateListData,
  updateListLevelAnalysis,
  updateSelectedLocations,
} from '../../../../../locations/js/actions/locationActions';
import { COMMON_FILTER_KEYS, defaultFilterValues } from '../defaultFilterValues';
import LocationsSummary from './LocationsSummary';
import CopyMoveModal from '../../modals/CopyMoveModal';
import fetch from '../../../../../common/js/utils/fetch';
import httpRequest from '../../../../../common/js/utils/httpRequest';
import Banner from '../../../../../common/js/components/Banners/Banner';
import InfoBubble from '../../../../../common/js/components/InfoBubble';
import infoBubbleConfig from '../../../../../common/js/constants/info-bubble-config.constants';
import {
  checkColumnListDraftList,
  isHiddenColumnInPost2020riskTable,
  isHiddenColumnInAlertsTable,
  checkColumnListCR,
  checkColumnListFC,
  checkColumnListGFWCR,
  checkColumnListGFWFC,
  checkColumnListPA,
  getListFilteredLocations,
  dataCleanup,
  containsPunctuation,
} from '../../../../../locations/js/utils/lists.utils';
import ShareList from '../../../../../locations/js/components/ShareList/ShareList';
import { FailedPopupDialog } from '../../../../../locations/js/components/landing/FailedPopupDialog';
import {
  getIsDiagnosticStatusDraft,
  getIsDraftWithoutDiagnostic,
} from '../../../utils/draft.utils';
import {
  getDialogContent,
  getDialogTitle,
} from '../../../../../locations/js/utils/dialogMessage.utils';
import ConfirmDialog from '../../../../../locations/js/components/lists/download/confirmDialog';

import ChangeTypeOfAnalysisModal from '../../../../../locations/js/components/landing/listItem/ChangeTypeOfAnalysisModal';
import getActiveAnalysisType from '../../../../../../utils/getActiveAnalysisType';
import ListActions from './ListActions';
import { formatDateForCurrentBrowserLanguage } from '../../../../../common/js/utils/format';
import WrappedReactTable from './WrappedReactTable';
import { getActiveAnalysisFlags } from '../../../utils/listDetails.utils';
import AnalysisStatusBanners from './AnalysisStatusBanners';
import StaleAnalysisBanner, { getStaleAnalysisIds } from './StaleAnalysisBanner';
import { fetchEnrichedAnalysisStatuses } from '../../../../../common/js/utils/selectedAnalysesCache';
import AnalysisFailedMessage from './AnalysisFailedMessage';
import AnalysisInProgressMessage from './AnalysisInProgressMessage';
import GHGBanner from './GHGBanner';
import CARAccordion from './CARAccordion';
import LocationErrorsAlert from './LocationErrorsAlert';
import AlertsUnsubscribeBanner from './AlertsUnsubscribeBanner';
import RetirementBanner from '../../../../../common/js/components/Banners/RetirementBanner';

// STYLE
import '../../../../../locations/css/lists.scss';
import '../../../../../locations/css/locations.scss';
import '../../../../../locations/css/react-table.scss';
import './ListDetails.scss';

// CONSTANTS
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import {
  GFW_LISTS_NUMBER_CONSTANTS,
  gfwListsNames,
} from '../../../../../../config/env/gfwLists.constants';
import { getListFilterValues } from '../getListFilterValues';
import getAllColumnNames from '../getAllColumnNames';
import {
  analysisTypes,
  AlertsAnalysisFrequency,
} from '../../../../../../config/env/analysisTypes.constants';
import {
  FOREST_CHANGE_VIEW,
  COMMODITY_RISK_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
  ALERTS,
  forestDataSet,
} from './listViews.constants';
import { AlertsDateSelector } from './components/AlertsDateSelector';
import { getManualTranslation } from '../../../config/columns/columnHeaders.constants';

const ACTIONS = {
  COPY: 'copy',
  MOVE: 'move',
};

const LIST_TYPES = {
  EXISTING: 'existing',
  NEW: 'new',
};

// Utility function to get button label for copy/move actions
const getButtonLabel = (selectedMoveOrCopy) => {
  return selectedMoveOrCopy === ACTIONS.MOVE ? 'Move Location(s)' : 'Copy Location(s)';
};

const MODES = {
  DRAFT: 'draft',
  SUBMIT: 'submit',
};

const DIAGNOSTICS_URLS = {
  [POST_2020_RISK_ASSESSMENT_VIEW]: '/api/afi/download?listId=[list-id]',
  [FOREST_CHANGE_VIEW]:
    '/locations/csv/[list-id]?type=everything&order=asc&aggregate=true&listView=forest_change&isGFWList=false&analysisAreaMin=0&source=diagnostics',
  [ALERTS]:
    '/locations/csv/[list-id]?listID=[list-id]&format=csv&type=alerts&selectedAlert=Integrated&selectedTimeframe=DAY&isGFWList=false&startDate=[start-date]&endDate=[end-date]',
};

const VIEW_LABELS = {
  [FOREST_CHANGE_VIEW]: 'Post-2000 Forest Change',
  [COMMODITY_RISK_VIEW]: 'Palm Risk Assessment',
  [POST_2020_RISK_ASSESSMENT_VIEW]: 'Post-2020 Risk Assessment',
  [ALERTS]: 'Alerts',
};

export default class ListDetails extends Component {
  constructor(props) {
    super(props);

    const { selectedLists } = this.props;
    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;
    const listAnalysesStatus = selectedList ? selectedList.listAnalysesStatus : [];
    // Adding PalmRisk analysis to pre selected analysis
    listAnalysesStatus?.forEach(({ analysisId, options, status }) => {
      const isFCDWithPalmRisk =
        analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS &&
        options === analysisTypes.PALM_RISK;
      // If the list has FCD with PalmRisk as option, we add PalmRisk as pre selected analysis - GPV-5016
      if (isFCDWithPalmRisk) {
        listAnalysesStatus.push({
          analysisId: analysisTypes.PALM_RISK,
          status, // same status as FCD analysis
        });
      }
    });

    const {
      isFcdActive,
      isPalmRiskActive,
      isAfiActive,
      isGHGActive,
      isOnlyGHGActive,
      isDcfActive,
    } = getActiveAnalysisFlags(selectedList);

    const isAlertsUnsubscribeBannerDismissed = !!localStorage.getItem(
      ALERTS_UNSUBSCRIBE_BANNER_KEY
    );

    this.state = {
      bannerContent: '',
      commodityType: '',
      searchInputValue: '', // controlled text input value
      filterString: '', // filter string value
      listFilteredLocations: [],
      listNotAccessible: false,
      hideCountry: true,
      hideTitle: true,
      listColumns: [],
      combinedColumns: [],

      isCountriesPopoverOpen: false,
      dialogOpen: false,
      rerunDialogState: false,
      currentAdminAreas: [], // adminAreas
      pAreas: [],
      currentFolder: selectedLists.length ? selectedLists[0].folder : null,
      isLoading: !!selectedLists.length,
      isManageListFolderOpen: false,
      searchedLocations: [],
      selectedMoveOrCopy: ACTIONS.COPY,
      selectedNewOrExisting: LIST_TYPES.EXISTING,
      newListName: '',
      isNewListNameDuplicate: false,
      isNewListNameValid: false,
      refreshPage: false,
      draftSubmitDialogOpen: false,
      isSaveAsDraft: false,
      showSubmitModal: false,
      page: 0,
      numberOfPages: 1,
      isEveryRowSelected: false,
      filterValues: [],
      parentCompanyOptionsForFilter: [],
      supplierNameOptionsForFilter: [],
      secondSupplierNameOptionsForFilter: [],
      tableSortedBy: 'Location Name',
      tableSortedDesc: false,
      numberOfResults: undefined,
      visibleColumns: ['ID Type', 'ID', 'Palm Mill ID', 'ID Updated Date'],
      isChangeTypeOfAnalysisModalOpen: false,
      isListSubmittedForAnalysis: false,
      isFcdActive,
      isPalmRiskActive,
      isAfiActive,
      isGHGActive,
      isOnlyGHGActive,
      isAlertsUnsubscribeBannerDismissed,
      isDownloadDialogOpen: false,
      isAlertsDateSelectorOpen: false,
      forestDataset: forestDataSet.NaturalForestMap,
      isDcfActive,
      syntheticWeeklyEntry: null,
      staleAnalysisIds: [],
      tabFiltersClearedNotification: false,
      tabFiltersClearedPrevTab: '',
    };
  }

  refreshColumns = (newForestDataset) => {
    const { listView, listData, selectedLists } = this.props;
    return getAllColumnNames(
      listView,
      listData[0],
      selectedLists,
      this.getCheckboxColumn,
      this.areAllAnalysesDraft(),
      newForestDataset || this.state.forestDataset
    );
  };

  changeDataSource = (event) => {
    const newForestDataset = event.target.value;

    const columnNames = this.refreshColumns(newForestDataset);
    this.setState({
      forestDataset: newForestDataset,
      combinedColumns: columnNames.combinedColumns,
    });
  };

  componentDidMount() {
    const { listData, filters, selectedLists } = this.props;
    const { list_name, id, isGlobalForestWatchList, associated_gfwlist } = selectedLists[0];

    // Add synthetic Weekly analysis entry after mount so the feature flag is read
    // from localStorage after the async getFeatureFlags() call resolves
    const syntheticWeeklyEntry = this.computeSyntheticWeeklyEntry(selectedLists[0]);
    if (syntheticWeeklyEntry) {
      this.setState({ syntheticWeeklyEntry });
    }
    gtag('event', 'User accessed list', {
      event_category: 'List Interaction',
      event_label: 'Accessed List: ' + list_name,
      list_name,
      list_id: id,
      is_gfw_list: !!isGlobalForestWatchList,
      associated_gfwlist,
    });

    this.loadLocationView();

    filterListData(
      listData,
      filters,
      selectedLists[0],
      this.getAdministrativeAreasData,
      this.getProtectedAreasData
    );

    getListFilterValues(selectedLists[0].id).then(
      ({
        filterValues,
        parentCompanyOptionsForFilter,
        supplierNameOptionsForFilter,
        secondSupplierNameOptionsForFilter,
      }) => {
        this.setState({
          filterValues,
          parentCompanyOptionsForFilter,
          supplierNameOptionsForFilter,
          secondSupplierNameOptionsForFilter,
        });
      }
    );

    store.dispatch(updateSelectedLocations([]));

    this.fetchStaleAnalysisData(selectedLists[0]?.id);
  }

  fetchStaleAnalysisData(listId) {
    if (!listId) {
      return;
    }
    fetchEnrichedAnalysisStatuses(listId)
      .then((enrichedStatuses) => {
        const staleAnalysisIds = getStaleAnalysisIds(enrichedStatuses);
        this.setState({ staleAnalysisIds });
      })
      .catch((error) => {
        console.warn('Failed to fetch stale analysis data', error);
      });
  }

  computeSyntheticWeeklyEntry(selectedList) {
    const listAnalysesStatus = selectedList?.listAnalysesStatus;
    if (!listAnalysesStatus) {
      return null;
    }
    const weeklyAlreadyAdded = listAnalysesStatus.some(
      (a) => a.analysisId === AlertsAnalysisFrequency.WEEKLY
    );
    if (weeklyAlreadyAdded) {
      return null;
    }
    const alertsWithWeekly = listAnalysesStatus.find(
      ({ analysisId, options }) =>
        analysisId === analysisTypes.ALERTS && options === AlertsAnalysisFrequency.WEEKLY
    );
    if (!alertsWithWeekly) {
      return null;
    }
    return { analysisId: AlertsAnalysisFrequency.WEEKLY, status: alertsWithWeekly.status };
  }

  componentDidUpdate(prevProps) {
    const { listView, selectedLists, filters } = this.props;

    const prevSelectedList = prevProps.selectedLists[0];
    const currSelectedList = selectedLists[0];
    if (prevSelectedList?.id !== currSelectedList?.id) {
      this.setState({ syntheticWeeklyEntry: this.computeSyntheticWeeklyEntry(currSelectedList) });
    }

    if (listView !== prevProps.listView) {
      const columnNames = this.refreshColumns();

      this.setState({
        listColumns: columnNames.list.filter((c) => this.showListColumn(c)),
        combinedColumns: columnNames.combinedColumns,
      });
      if (!selectedLists[0].isGlobalForestWatchList) {
        this.getUserLocationData(selectedLists[0].id);
      }
    }

    const previousKeys = Object.keys(prevProps.filters);
    const currentKeys = Object.keys(filters);

    if (
      previousKeys.length !== currentKeys.length ||
      previousKeys.some((key) => filters[key] !== prevProps.filters[key])
    ) {
      this.getLocationsData(selectedLists[0].id, selectedLists[0].isGlobalForestWatchList);
    }
  }

  getLocationsData = (listId, isGfwList, page = 0) => {
    if (isGfwList) {
      this.getFilteredGfwListData(listId, page);
    } else {
      this.getUserLocationData(listId, page);
    }
  };

  getFilteredGfwListData = (listId, page = 0) => {
    // if the filters changed and this is a user list, get the paginated data from the API
    const { listData, selectedLists, filters } = this.props;

    const { OIL_PALM_CONCESSIONS, PALM_OIL_MILLS, RSPO_PALM_CONCESSIONS } =
      GFW_LISTS_NUMBER_CONSTANTS;

    this.setState({ page });

    if ([OIL_PALM_CONCESSIONS, PALM_OIL_MILLS, RSPO_PALM_CONCESSIONS].includes(listId)) {
      this.getGFWLocationData(listId, page);
    } else {
      filterListData(
        listData,
        filters,
        selectedLists[0],
        this.getAdministrativeAreasData,
        this.getProtectedAreasData,
        page
      );
    }
  };

  handleDialogClose = (shouldRefresh) => {
    if (shouldRefresh) {
      window.location.reload();
    } else {
      this.setState({ dialogOpen: false });
    }
  };

  // Update how many locations are selected
  setLocationCheckbox = (location_id) => {
    const { selectedLocations } = this.props;
    const { filterString, allLocationsSelected } = this.state;
    const index = selectedLocations.indexOf(location_id);
    const tempLocations = selectedLocations.slice();

    if (allLocationsSelected) {
      this.setState({ allLocationsSelected: false });
    }

    if (index > -1) {
      tempLocations.splice(index, 1);
    } else {
      tempLocations.push(location_id);
    }

    this.getSearchedLocations(filterString, tempLocations);
    store.dispatch(updateSelectedLocations(tempLocations));

    gtag('event', 'Location checkbox clicked', {
      event_category: 'List View Click',
      event_label: 'user checked/unchecked a location in the list',
    });
  };

  selectAllLocations = (evt) => {
    const { selectedLocations, filteredData, filteredLocationData } = this.props;
    const { listFilteredLocations } = this.state;
    const isEveryRowSelected = evt.target.checked;
    this.setState({
      isEveryRowSelected,
      isLoading: true,
    });

    if (
      (!isEveryRowSelected && selectedLocations.length === filteredData.length) ||
      (selectedLocations.length === listFilteredLocations.length &&
        listFilteredLocations.length !== 0)
    ) {
      store.dispatch(updateSelectedLocations([]));

      gtag('event', 'Location checkbox clicked', {
        event_category: 'List View Click',
        event_label: 'user unchecked all locations in the list',
      });
    } else {
      const locationIDs =
        listFilteredLocations.length > 0
          ? listFilteredLocations.map((v) => v.location_id)
          : filteredLocationData.map((v) => v.location_id);
      store.dispatch(updateSelectedLocations(locationIDs));

      gtag('event', 'Location checkbox clicked', {
        event_category: 'List View Click',
        event_label: 'user checked all locations in the list',
      });
    }

    this.setState({
      isLoading: false,
    });
  };

  cancelDialog = () => {
    this.setState({ dialogChildren: null, dialogContent: null, dialogActions: null });
    this.handleDialogClose(false);
  };

  updateSelectedMove = (e) => {
    this.setState({ selectedListMove: e.value, dialogChildren: true });
  };

  replaceWithCurrentListName = (text, listName) => {
    return text.replace('[list-name]', listName);
  };

  // Whenever the user deletes all locations... delete the list
  deleteList = (selectedLists) => {
    this.handleDialogClose(false);
    // clear the custom dialog buttons
    this.setState({
      dialogActions: null,
      isLoading: true,
    });
    const selectedList = selectedLists[0];
    const { id: list_id, list_name: listName, associated_gfwlist: gwfListId } = selectedList;

    httpRequest
      .fetchJSON('/locations/lockList', { list_id })
      .then(() => {
        // Use the working deleteLocations endpoint instead of broken deleteAllFilteredLocations
        const { selectedLocations } = this.props;
        httpRequest
          .fetchJSON('/locations/deleteLocations', {
            list_id,
            location_ids: selectedLocations,
            gfw_list_id: gwfListId,
          })
          .then((response) => {
            if (response.includes('Deleted')) {
              this.setState({
                dialogOpen: true,
                dialogTitle: locationsPage.lists.deleteLocationsMessages.success.title,
                dialogContent: this.replaceWithCurrentListName(
                  locationsPage.lists.deleteLocationsMessages.success.message,
                  listName
                ),
                refreshPage: true,
                isLoading: false,
              });
              gtag('event', 'locations all deleted', {
                event_category: 'Lists Click',
                event_label: 'user deleted all locations from their own list',
              });

              if (response === 'AllLocationsDeleted') {
                window.location.href = '/locations';
              }
            } else {
              errorLogger.warn('Got unrecognized location delete response', {
                component: 'ListDetails',
                action: 'handleDeleteAllLocations',
                response,
              });
              this.setState({
                dialogOpen: true,
                dialogTitle: locationsPage.lists.deleteLocationsMessages.error.title,
                dialogContent: locationsPage.lists.deleteLocationsMessages.error.message,
                isLoading: false,
              });
            }
          })
          .catch((err) => {
            this.setState({
              deleteList: false,
              deleteListFailed: true,
              isLoading: false,
            });
            errorLogger.error('DeleteList action error', {
              component: 'ListDetails',
              action: 'handleDeleteAllLocations',
              error: err,
            });
          });
      })
      .catch((err) => {
        errorLogger.error('Error locking list for deletion', {
          component: 'ListDetails',
          action: 'handleDeleteAllLocations',
          error: err,
        });
        this.setState({
          dialogOpen: true,
          dialogTitle: locationsPage.lists.deleteLocationsMessages.error.title,
          dialogContent: locationsPage.lists.deleteLocationsMessages.error.message,
          isLoading: false,
        });
      });
  };

  // Delete the selected locations after user has confirmed the action.
  deleteSelectedLocations = () => {
    this.handleDialogClose(false);
    // clear the custom dialog buttons
    this.setState({ dialogActions: null, isLoading: true });
    const { selectedLists, selectedLocations } = this.props;
    const { isEveryRowSelected } = this.state;

    if (!selectedLists.length || !selectedLocations.length) {
      errorLogger.warn('Attempting to delete locations without selecting any', {
        component: 'ListDetails',
        action: 'deleteSelectedLocations',
        selectedListsCount: selectedLists.length,
        selectedLocationsCount: selectedLocations.length,
      });
      return;
    }

    // If we are deleting all locations...
    if (isEveryRowSelected) {
      this.deleteList(selectedLists);
      return;
    }
    const selectedList = selectedLists[0];
    const { id: listId, list_name: listName, associated_gfwlist: gwfListId } = selectedList;

    // Ensure list is unlocked before attempting to delete locations from it
    httpRequest.fetchJSON('/locations/lockList', { list_id: listId }).then(() => {
      httpRequest
        .fetchJSON('/locations/deleteLocations', {
          list_id: listId,
          location_ids: selectedLocations,
          gfw_list_id: gwfListId,
        })
        .then((response) => {
          if (response.includes('Deleted')) {
            this.setState({
              dialogOpen: true,
              dialogTitle: locationsPage.lists.deleteLocationsMessages.success.title,
              dialogContent: this.replaceWithCurrentListName(
                locationsPage.lists.deleteLocationsMessages.success.message,
                listName
              ),
              refreshPage: true,
              isLoading: false,
            });
            gtag('event', 'locations deleted', {
              event_category: 'Lists Click',
              event_label: 'user deleted locations from their own list',
            });

            if (response === 'AllLocationsDeleted') {
              window.location.href = '/locations';
            }
          } else if (response.includes('isLocked')) {
            // Shouldn't happen due to call to unlock list above, but handle it if it does
            this.setState({
              dialogOpen: true,
              dialogTitle: locationsPage.lists.deleteLocationsMessages.listLocked.title,
              dialogContent: locationsPage.lists.deleteLocationsMessages.listLocked.message,
              isLoading: false,
            });
          } else {
            errorLogger.warn('Got unrecognized location delete response', {
              component: 'ListDetails',
              action: 'deleteSelectedLocations',
              response,
            });
            this.setState({
              dialogOpen: true,
              dialogTitle: locationsPage.lists.deleteLocationsMessages.error.title,
              dialogContent: locationsPage.lists.deleteLocationsMessages.error.message,
              isLoading: false,
            });
          }
        })
        .catch((err) => {
          errorLogger.error('Error deleting selected locations', {
            component: 'ListDetails',
            action: 'deleteSelectedLocations',
            error: err,
          });
          this.setState({
            dialogOpen: true,
            dialogTitle: locationsPage.lists.deleteLocationsMessages.error.title,
            dialogContent: locationsPage.lists.deleteLocationsMessages.error.message,
            isLoading: false,
          });
        });
    });
  };

  // Prompt to delete the locations currently selected in the list
  promptDeleteSelectedLocations = () => {
    this.setState({
      dialogActions: (
        <>
          <PillButton
            onClick={this.deleteSelectedLocations}
            variant="contained"
            color="primary"
            size="small"
            className="dialog__primary-action"
          >
            {locationsPage.lists.ok}
          </PillButton>
          <PillButton onClick={this.cancelDialog} variant="text" color="info" size="small">
            {locationsPage.lists.cancel}
          </PillButton>
        </>
      ),
      dialogOpen: true,
      dialogTitle: locationsPage.lists.deleteLocationsMessages.confirm.title,
      dialogContent: locationsPage.lists.deleteLocationsMessages.confirm.message,
    });
  };

  handleMoveError = (moveError) => {
    errorLogger.warn('locations move/copy failed with error', {
      component: 'ListDetails',
      action: 'handleMoveError',
      moveError,
    });
    if (moveError === 'listNotAccessible') {
      this.setState({
        isLoading: false,
        listNotAccessible: true,
      });
    } else if (
      Object.prototype.hasOwnProperty.call(locationsPage.lists.copyMoveMessages, moveError)
    ) {
      this.setState({
        dialogOpen: true,
        dialogTitle: locationsPage.lists.copyMoveMessages[moveError].title,
        dialogContent: locationsPage.lists.copyMoveMessages[moveError].message,
        refreshPage: true,
        isLoading: false,
      });
    } else {
      this.setState({
        dialogOpen: true,
        dialogTitle: locationsPage.lists.copyMoveMessages.serverError.title,
        dialogContent: locationsPage.lists.copyMoveMessages.serverError.message,
        refreshPage: true,
        isLoading: false,
      });
    }
  };

  // Move the selected locations after user has confirmed the action.
  moveSelectedLocations = async () => {
    this.handleDialogClose(false);
    this.setState({ dialogActions: null, dialogChildren: null, showSubmitModal: false });

    const { addType, filteredLocationData, selectedLists, filters, selectedLocations, userLists } =
      this.props;

    const {
      commodityType,
      newListName,
      selectedMoveOrCopy,
      selectedNewOrExisting,
      selectedListMove,
      isSaveAsDraft,
      isEveryRowSelected,
    } = this.state;

    if (!selectedLists.length || !selectedLocations.length) {
      errorLogger.warn('Attempting to move locations without selecting any', {
        component: 'ListDetails',
        action: 'moveSelectedLocations',
        selectedListsCount: selectedLists.length,
        selectedLocationsCount: selectedLocations.length,
      });
      return;
    }

    // Full location objects for selected locations
    const locationData = filteredLocationData
      .filter((location) => selectedLocations.includes(location.location_id))
      .sort((a, b) => a.location_id - b.location_id);

    const userListNames = userLists.map((list) => list.list_name.toLowerCase());
    const selectedList = selectedLists[0];
    const moveToList =
      selectedNewOrExisting === LIST_TYPES.EXISTING
        ? userLists.find((list) => list.list_name === selectedListMove)
        : null;

    this.setState({
      isLoading: true,
    });

    const destinationListName = moveToList?.list_name || newListName;

    const getCopyMoveDialogContent = ({ type = 'success', action, selectedLocations = [] }) => {
      if (type === 'error') {
        return {
          dialogTitle: 'Something Went Wrong',
          dialogContent: 'An error occurred while processing your request.',
        };
      }
      const noun = `Location${selectedLocations.length > 1 ? 's' : ''}`;

      return {
        dialogTitle: `${noun} ${action} initiated`,
        dialogContent: `${noun} ${action} process started, this can take a while, please be patient.`,
      };
    };

    if (!selectedList.isGlobalForestWatchList) {
      try {
        await httpRequest.fetchJSON('/locations/lockList', { list_id: selectedList.id });

        const gfw_list_id =
          !moveToList?.associated_gfwlist || moveToList?.associated_gfwlist === 'null'
            ? 0
            : moveToList.associated_gfwlist;

        const myFilters = {
          analysisAreaMin: 0,
          ...(filters.selectedCountry && { country: filters.selectedCountry }),
          ...(filters.selectedState && { state: filters.selectedState }),
          ...(filters.selectedSubState && { subState: filters.selectedSubState }),
        };

        const copyLocationsRequestBody = {
          listId: selectedList.id,
          srcListAnalysisTable: selectedList.list_analysis_table_name,
          selectedListLocationClassification: selectedList.location_classification,
          customAttributesNames: [],
          userListNames,
          action: selectedMoveOrCopy,
          listType: selectedNewOrExisting,
          listName: newListName,
          targetList: moveToList,
          selectedLocations,
          addType,
          commodityType,
          saveAsDraft: isSaveAsDraft,
          gfwListId: gfw_list_id,
          isEveryRowSelected,
          filters: myFilters,
        };

        await fetch({
          url: 'locations/cm-large-list',
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: copyLocationsRequestBody,
        });

        const dialog = getCopyMoveDialogContent({ action: selectedMoveOrCopy, selectedLocations });
        this.setState({ ...dialog, dialogOpen: true, refreshPage: true, isLoading: false });
      } catch (error) {
        errorLogger.error('/locations/cm-large-list error', {
          component: 'ListDetails',
          action: 'moveSelectedLocations',
          error,
        });
        const dialog = getCopyMoveDialogContent({ type: 'error' });
        this.setState({ ...dialog, dialogOpen: true, refreshPage: true, isLoading: false });
      }
    } else {
      try {
        const response = await saveGfwListLocations(
          selectedList,
          newListName,
          userListNames,
          selectedNewOrExisting,
          addType,
          commodityType,
          locationData,
          selectedLists,
          moveToList,
          isSaveAsDraft
        );

        // locations copy/move has finished
        if (Object.prototype.hasOwnProperty.call(locationsPage.lists.copyMoveMessages, response)) {
          const dialogTitle = getDialogTitle(response, locationData.length);
          const dialogContent = getDialogContent(
            response,
            destinationListName,
            isSaveAsDraft,
            locationData.length
          );
          this.setState({
            dialogOpen: true,
            refreshPage: true,
            isLoading: false,
            dialogTitle,
            dialogContent,
          });
        } else {
          errorLogger.warn('Location(s) copy/move completed with unrecognized response', {
            component: 'ListDetails',
            action: 'moveSelectedLocations',
            response,
          });
          const { title, message } = locationsPage.lists.copyMoveMessages.serverError;
          this.setState({
            dialogOpen: true,
            dialogTitle: title,
            dialogContent: message,
            refreshPage: true,
            isLoading: false,
          });
        }
      } catch (moveError) {
        this.handleMoveError(moveError);
      }
    }
  };

  setMoveOrCopy = (evt) => {
    const {
      selectedNewOrExisting,
      newListName,
      isNewListNameDuplicate,
      isNewListNameValid,
      isOnlyGHGActive,
    } = this.state;
    const selectedMoveOrCopy = evt.target.value;
    // The API doesn't support moving to a new list, only copying, so we auto-select the 'existing' option if the user
    // chooses to move.

    this.setState({
      selectedMoveOrCopy,
      selectedNewOrExisting:
        selectedMoveOrCopy === ACTIONS.MOVE ? LIST_TYPES.EXISTING : selectedNewOrExisting,
      dialogChildren: true,
      dialogTitle:
        selectedMoveOrCopy === ACTIONS.MOVE
          ? locationsPage.lists.moveLocationsDialogHeader
          : locationsPage.lists.copyLocationsDialogHeader,
      dialogActions: (
        <>
          <PillButton
            className="dialog__primary-action"
            variant="contained"
            color="primary"
            onClick={() => {
              const trackCopyMove = (action, mode = MODES.DRAFT) => {
                const capitalized = {
                  [ACTIONS.COPY]: 'Copy',
                  [ACTIONS.MOVE]: 'Move',
                };

                const event = `${capitalized[action]} List`;
                const label =
                  mode === MODES.DRAFT
                    ? `User ${action === ACTIONS.COPY ? 'copies' : 'moves'} a list to draft`
                    : `User ${action === ACTIONS.COPY ? 'copies' : 'moves'} a list and submits`;

                gtag('event', event, {
                  event_category: capitalized[action],
                  event_label: label,
                });
              };

              trackCopyMove(selectedMoveOrCopy, MODES.DRAFT);
              this.setState({ isSaveAsDraft: true }, () => {
                this.moveSelectedLocations();
              });
            }}
            disabled={
              isOnlyGHGActive &&
              selectedNewOrExisting === LIST_TYPES.NEW &&
              (!newListName || isNewListNameDuplicate || isNewListNameValid)
            }
          >
            {getButtonLabel(selectedMoveOrCopy)}
          </PillButton>

          <Link component="button" type="button" onClick={this.cancelDialogResetName}>
            {locationsPage.lists.cancel}
          </Link>
        </>
      ),
    });
  };

  setNewOrExisting = (evt) => {
    const selectedNewOrExisting = evt.target.value;
    this.setState({
      selectedNewOrExisting,
      dialogChildren: true,
    });
    this.promptMoveSelectedLocations({ ...this.state, selectedNewOrExisting });
  };

  updateNewListName = (newListName) => {
    const { userLists } = this.props;
    const isNewListNameDuplicate =
      userLists.filter((list) => list.list_name === newListName).length > 0;
    const isNewListNameValid = containsPunctuation(newListName);
    this.setState({
      newListName,
      isNewListNameDuplicate,
      isNewListNameValid,
      dialogChildren: true,
    });
    this.promptMoveSelectedLocations({
      ...this.state,
      newListName,
      isNewListNameDuplicate,
      isNewListNameValid,
    });
  };

  cancelDialogResetName = () => {
    this.setState({ newListName: '' });
    this.cancelDialog();
  };

  // Prompt to move the locations currently selected in the list
  promptMoveSelectedLocations = ({
    newListName,
    isNewListNameDuplicate,
    isNewListNameValid,
    selectedNewOrExisting,
  }) => {
    const { selectedLocations, selectedMoveOrCopy } = this.props;
    const { isOnlyGHGActive } = this.state;
    if (selectedLocations.length > maxLocations) {
      this.setState({
        dialogOpen: true,
        dialogTitle: locationsPage.lists.copyMoveMessages.ListTooLarge.title,
        dialogContent: locationsPage.lists.copyMoveMessages.ListTooLarge.message,
        isSaving: false,
        refreshPage: false,
        closeAction: this.closeDialog,
        dialogActions: null,
      });
    } else {
      const trackCopyMove = (action, mode = MODES.DRAFT) => {
        const capitalized = {
          [ACTIONS.COPY]: 'Copy',
          [ACTIONS.MOVE]: 'Move',
        };

        const event = `${capitalized[action]} List`;
        const label =
          mode === MODES.DRAFT
            ? `User ${action === ACTIONS.COPY ? 'copies' : 'moves'} a list to draft`
            : `User ${action === ACTIONS.COPY ? 'copies' : 'moves'} a list and submits`;

        gtag('event', event, {
          event_category: capitalized[action],
          event_label: label,
        });
      };

      this.setState({
        dialogActions: (
          <>
            <PillButton
              className="dialog__primary-action"
              variant="contained"
              color="primary"
              onClick={() => {
                trackCopyMove(selectedMoveOrCopy, MODES.DRAFT);
                this.setState({ isSaveAsDraft: true }, () => {
                  this.moveSelectedLocations();
                });
              }}
              disabled={
                isOnlyGHGActive &&
                selectedNewOrExisting === LIST_TYPES.NEW &&
                (!newListName || isNewListNameDuplicate || isNewListNameValid)
              }
            >
              {getButtonLabel(selectedMoveOrCopy)}
            </PillButton>

            <Link component="button" type="button" onClick={this.cancelDialogResetName}>
              {locationsPage.lists.cancel}
            </Link>
          </>
        ),
        dialogOpen: true,
        dialogTitle:
          selectedMoveOrCopy === ACTIONS.MOVE
            ? locationsPage.lists.moveLocationsDialogHeader
            : locationsPage.lists.copyLocationsDialogHeader,
        dialogContent: '',
        dialogChildren: true,
      });
    }
  };

  // Set checkbox column to select lists
  getCheckboxColumn = () => {
    return {
      Header: () => {
        const { isEveryRowSelected } = this.state;
        return (
          <Checkbox
            id="column-checkbox-all"
            checked={isEveryRowSelected}
            onChange={this.selectAllLocations}
            sx={{ p: 0 }}
            inputProps={{ 'aria-label': 'Select all locations', className: 'column-checkbox' }}
            data-cy="select-all-locations"
          />
        );
      },
      id: 'checkbox',
      accessor: 'checkbox',
      width: 40,
      maxWidth: 40,
      className: 'td-checkbox',
      headerClassName: 'th-checkbox',
      show: true,
      sortable: false,
      Cell: (cellProps) => {
        const { selectedLocations } = this.props;

        return (
          <Checkbox
            checked={selectedLocations.indexOf(cellProps.original.location_id) !== -1}
            onChange={() => this.setLocationCheckbox(cellProps.original.location_id)}
            sx={{ p: 0 }}
            inputProps={{
              'aria-label': `Select location ${
                cellProps.original.location_name || cellProps.original.location_id
              }`,
              className: 'column-checkbox column-checkbox-single',
            }}
            data-cy={`select-location-${cellProps.original.location_id}`}
          />
        );
      },
    };
  };

  showListColumn = (column) => {
    const { selectedLists, listView } = this.props;
    if (column.accessor === 'total_count') {
      return false;
    }
    // Exclude columns if all analyses are drafts
    if (this.areAllAnalysesDraft()) {
      return !checkColumnListDraftList(column.accessor); // Exclude draft columns
    }

    if (selectedLists.length > 0) {
      const { isGlobalForestWatchList, list_name } = selectedLists[0];

      if (!isGlobalForestWatchList) {
        // Exclude columns based on listView
        if (listView === POST_2020_RISK_ASSESSMENT_VIEW) {
          return !isHiddenColumnInPost2020riskTable(column.accessor); // checks for excluded post-2020 risk columns
        }

        if (listView === FOREST_CHANGE_VIEW) {
          return !checkColumnListFC(column.accessor); // checks for excluded forest change columns
        }

        if (listView === COMMODITY_RISK_VIEW) {
          return !checkColumnListCR(column.accessor); // checks for excluded commodity risk columns
        }

        if (listView === ALERTS) {
          return !isHiddenColumnInAlertsTable(column.accessor); // checks for excluded alerts columns
        }

        // For unsupported views, exclude the column
        return false;
      }

      // For Global Forest Watch lists, exclude columns accordingly
      if (listView === FOREST_CHANGE_VIEW) {
        return !(
          checkColumnListGFWFC(list_name, column.accessor) ||
          checkColumnListPA(list_name, column.accessor)
        ); // checks for excluded GFW forest change or protected area columns
      }

      if (listView === COMMODITY_RISK_VIEW) {
        return !checkColumnListGFWCR(list_name, column.accessor); // checks for excluded GFW commodity risk columns
      }
    }

    // Default case: exclude the column
    return false;
  };
  /**
   * Set all list data
   * @param {Array} locationData - All locations for selected list
   * @param {Array} analysisData - All analysis for selected list
   * @returns {Array} data - Return data based on selected list
   */
  setListData = (locationData, analysisData) => {
    const { selectedLists } = this.props;
    const data = [];
    locationData.forEach((loc) => {
      // TODO - ENABLE IN PHASE 1.1
      // const flag = {
      //   flag_forma: loc.flag_forma,
      //   flag_general: loc.flag_general,
      //   flag_glad: loc.flag_glad,
      //   flag_gran_chaco: loc.flag_gran_chaco,
      //   flag_terrai: loc.flag_terrai,
      //   flag_viirs: loc.flag_viirs
      // };

      if (
        selectedLists[0].list_name ===
        gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.ADMINISTRATIVE_AREAS]
      ) {
        if (loc['Location Name']) {
          const splitsies = loc['Location Name'].split('--');
          if (splitsies.length > 0) {
            loc['Location Name'] = splitsies[splitsies.length - 1];
          }
        }
        if (loc['Investment Name']) {
          const splitsies = loc['Investment Name'].split('--');
          if (splitsies.length > 0) {
            loc['Investment Name'] = splitsies[splitsies.length - 1];
          }
        }
      }

      if (!this.areAllAnalysesDraft() && analysisData.length > 0) {
        let analysisList;
        if (
          selectedLists[0].list_name ===
            gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.PROTECTED_AREAS] ||
          selectedLists[0].list_name ===
            gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.ADMINISTRATIVE_AREAS]
        ) {
          // for protected areas and admin areas we dont match list_ids, just location ids
          [analysisList] = analysisData.filter(
            (analysis) => analysis.location_id === loc.location_id
          );
        } else {
          [analysisList] = analysisData.filter(
            (analysis) =>
              analysis.location_id === loc.location_id && analysis.list_id === loc.list_id
          );
        }
        data.push({ ...loc, ...analysisList });
      } else {
        data.push({ ...loc });
      }
    });
    return dataCleanup(data);
  };

  /**
   * Processing list data returned from DB set list/analysis/checkbox columns and combine list/analysis data
   * @param {Object} listData - Represent list data received from SERVICE
   * @param {Boolean} locationNameForGFW - Defines if parameter is coming from location name for GFW.
   * @param {Boolean} userLocation - Defines if parameter is locations in a user list coming from the Map.
   */
  processListData = (listData) => {
    const { selectedLists, listView } = this.props;
    const { isEveryRowSelected } = this.state;
    const { list_analysis, location_analyses } = listData;

    if (location_analyses) {
      const [locationData, analysisData] = location_analyses || [];

      if (locationData?.length) {
        const data = this.setListData(locationData, analysisData);

        const columnNames = getAllColumnNames(
          listView,
          locationData[0],
          selectedLists,
          this.getCheckboxColumn,
          this.areAllAnalysesDraft(),
          this.state.forestDataset
        );
        const filteredIds = data.map((d) => d.location_id);
        store.dispatch(updateListData(data));
        store.dispatch(updateFilteredData(filteredIds));
        store.dispatch(updateListLevelAnalysis(list_analysis));

        if (isEveryRowSelected) {
          store.dispatch(updateSelectedLocations(filteredIds));
        }

        this.setState({
          listColumns: columnNames.list.filter((c) => this.showListColumn(c)),
          combinedColumns: columnNames.combinedColumns,
          isLoading: false,
        });
      } else {
        store.dispatch(updateListData([]));
        this.setState({
          isLoading: false,
        });
      }
    } else {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Analysis Failure',
        dialogContent: 'Analysis for this list is not available.',
        isLoading: false,
      });
    }
  };

  getGFWDataFromMap = (gfwList, globalIds) => {
    const { stopLoading } = this.props;

    const updatedGlobalIds = [1, 2, 3].includes(gfwList.id)
      ? globalIds
      : globalIds.map((id) => id.slice(1, -1));
    const params = `list_id=${gfwList.id}&global_ids=["${updatedGlobalIds}"]`;
    httpRequest
      .fetchForm('/locations/getGFWListLocationsGlobalId', params)
      .then((response) => {
        const locations = JSON.parse(response);
        if (locations) {
          this.processListData(locations);
        } else {
          this.setState({ isLoading: false });
          store.dispatch(updateListData([]));
          store.dispatch(updateFilteredData([]));
        }
        stopLoading();
      })
      .catch((err) => {
        errorLogger.warn('error with grabbing GFW List location data', {
          component: 'ListDetails',
          action: 'getGFWLocationData',
          error: err,
        });
        this.setState({ isLoading: false });
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
        stopLoading();
      });
  };

  /**
   * Determines whether all applicable analyses in the selected list are in Draft status,
   * or if only GHG is active, and the list is not a Global Forest Watch list.
   *
   * @returns {Boolean} True if all applicable analyses are in Draft status (with sub-analyses excluded),
   * or if only GHG is active, and the list is not a GFW list.
   */
  areAllAnalysesDraft = () => {
    const { selectedLists } = this.props;
    const { isOnlyGHGActive } = this.state;
    const listAnalysesStatus = selectedLists[0]?.listAnalysesStatus || [];
    const isSelectedListNotGFW = !selectedLists[0].isGlobalForestWatchList;

    // also true if there are no analyses selected
    const areAllAnalysesDraft = listAnalysesStatus.every(
      (item) => item.status === listStatus.Draft
    );
    return (isOnlyGHGActive || areAllAnalysesDraft) && isSelectedListNotGFW;
  };

  getUserLocationData = (list_id, page = 0) => {
    const { filters, stopLoading, listView } = this.props;
    const { tableSortedBy, tableSortedDesc, filterString } = this.state;

    this.setState({ page, isLoading: true });

    getUserLocationDataFromAPI(
      listView,
      filters,
      list_id,
      filterString,
      tableSortedBy,
      tableSortedDesc,
      page,
      this.areAllAnalysesDraft()
    )
      .then((response) => {
        const { list_analysis, location_analyses, numberOfPages, numberOfResults } = response;
        const listData = {
          list_analysis,
          location_analyses: [location_analyses, location_analyses],
        };

        this.setState({
          numberOfPages,
          numberOfResults,
        });

        this.processListData(listData);
      })
      .catch((err) => {
        errorLogger.warn('Error fetching user location data', {
          component: 'ListDetails',
          action: 'getUserLocationData',
          error: err,
          listId: list_id,
          page,
        });
        this.setState({ isLoading: false });
        stopLoading();
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
      });
  };

  getGFWLocationData = (list_id, page = 0) => {
    const { filters } = this.props;
    const { tableSortedBy, tableSortedDesc, filterString } = this.state;

    this.setState({ isLoading: true });

    fetch({
      url: '/locations/getGFWListLocationData',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },

      body: {
        list_id,
        pageNum: page,
        pageSize: 50,
        filters,
        filterString,
        tableSortedBy,
        tableSortedDesc,
      },
    })
      .then((response) => {
        const { numberOfPages, numberOfResults } = response;
        this.setState({
          numberOfPages,
          numberOfResults,
        });
        this.processListData(response);
      })
      .catch((err) => {
        errorLogger.warn('Error fetching filtered location data', {
          component: 'ListDetails',
          action: 'getFilteredLocationData',
          error: err,
        });
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
      });
  };

  viewDiagnostic = async (hoveredLocationId) => {
    const { selectedLists, userSharedLists, listView, selectedLocations } = this.props;
    const selectedList = selectedLists?.[0];
    const isGfwList = selectedList?.isGlobalForestWatchList;
    const listId = selectedList?.id;
    const selectedListIsShared =
      selectedLists &&
      userSharedLists &&
      userSharedLists.some((userSharedList) => userSharedList.id === listId);
    const locationId = hoveredLocationId ?? selectedLocations?.[0];
    const diagnosticsType = listView === POST_2020_RISK_ASSESSMENT_VIEW ? 'AFI' : 'FCD';
    const queryParams = {
      listId,
      ...(isGfwList && { gfw: 'true' }),
      ...(selectedListIsShared && { shared: 'true' }),
      ...(locationId && { locationId }),
      ...(!isGfwList && diagnosticsType && { type: diagnosticsType }),
    };
    const queryString = new URLSearchParams(queryParams).toString();
    window.location.href = `/diagnostics?${queryString}`;
  };

  handleSearchInputChange = (newValue) => {
    const { selectedLists } = this.props;
    const { filterString } = this.state;

    this.setState({
      searchInputValue: newValue,
    });

    const isGfwList = selectedLists[0].isGlobalForestWatchList;

    // if there was a filter string set and we cleared the input text
    if (newValue === '' && filterString !== '') {
      // user lists are paginated in the backend
      // so the search term is only set when pressing enter (see handleSearchInputKeyDown()) or when deleting the string
      this.setState(
        {
          filterString: '',
        },
        () => {
          this.getLocationsData(selectedLists[0].id, isGfwList);
        }
      );
    }
  };

  handleSearchInputKeyDown = (evt) => {
    // if enter key is pressed and it's not a GFW list, filter locations by input text
    const { selectedLists } = this.props;
    const isGfwList = selectedLists[0].isGlobalForestWatchList;
    if (evt.keyCode === 13) {
      this.setState(
        {
          filterString: evt.target.value.trim(),
        },
        () => {
          this.getLocationsData(selectedLists[0].id, isGfwList);
        }
      );
    }
  };

  handleSearchInputClick = () => {
    const { selectedLists } = this.props;
    const { filterString } = this.state;
    const isGfwList = selectedLists[0].isGlobalForestWatchList;
    if (filterString.trim()) {
      this.getLocationsData(selectedLists[0].id, isGfwList);
    }
  };

  getSearchedLocations = (filterString, selectedLocations) => {
    const { combinedColumns } = this.state;
    const { filteredLocationData } = this.props;
    let listFilteredLocations = [];
    let searchedLocations;

    if (filterString) {
      // replace with prop
      listFilteredLocations = getListFilteredLocations(
        filteredLocationData,
        combinedColumns,
        filterString
      );
    }
    if (listFilteredLocations.length > 0 && selectedLocations.length > 0) {
      searchedLocations = listFilteredLocations.filter((location) =>
        selectedLocations.includes(location.location_id)
      );
    }
    this.setState({
      searchedLocations: searchedLocations || [],
    });
  };

  openCountriesPopover = (event) => {
    event.preventDefault();

    this.setState({
      isCountriesPopoverOpen: true,
      anchorElCountries: event.currentTarget,
    });
  };

  closeCountriesPopover = () => {
    this.setState({
      isCountriesPopoverOpen: false,
      anchorElCountries: null,
    });
  };

  rerunList = () => {
    const { selectedLists } = this.props;
    const [firstElem] = selectedLists;
    const {
      list_analysis_table_name,
      list_name,
      list_table_name,
      template_id,
      list_locations_count,
      id: list_id,
    } = firstElem;

    this.setState({
      isLoading: true,
    });

    fetch({
      url: '/locations/rerunExistingList',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: {
        list_analysis_table_name,
        list_name,
        list_table_name,
        template_id,
        list_id,
        list_locations_count,
        list_status_id: listStatus.Pending,
        reanalyze: true,
      },
    })
      .then(() => {
        this.toggleReRunAnalysisDialog();
        this.setState({
          isLoading: false,
        });
      })
      .catch((err) => {
        errorLogger.warn('Error when re-running a list', {
          component: 'ListDetails',
          action: 'rerunAnalysis',
          error: err,
        });
        this.setState({
          isLoading: false,
        });
      });
    gtag('event', 'update button click', {
      event_category: 'List',
      event_label: 'user clicked on the ok button in the modal window to confirm updating the list',
    });
  };

  // Toggle the canopy modal
  toggleCanopyModal = () => {
    store.dispatch(toggleCanopyModal());
  };

  // Clear selected filters
  clearFilters = () => {
    this.setState({ numberOfResults: undefined });
    const { selectedLists, filteredData } = this.props;
    store.dispatch(clearFilters());
    store.dispatch(setFilterCount(0));
    if (
      selectedLists.length > 0 &&
      (selectedLists[0].list_name ===
        gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.ADMINISTRATIVE_AREAS] ||
        selectedLists[0].list_name === gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.PROTECTED_AREAS])
    ) {
      if (filteredData.length > 0) {
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
        store.dispatch(updateSelectedLocations([]));
      }
      store.dispatch(toggleCanopyModal());
    }
  };

  getAdministrativeAreasInfo = () => {
    store.dispatch(updateListData([]));
    store.dispatch(updateFilteredData([]));
    store.dispatch(updateSelectedLocations([]));
    this.setState({ isLoading: true });
    fetch({
      url: '/locations/getAdministrativeAreasInfo',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((currentAdminAreas) => {
        this.setState({
          currentAdminAreas,
          isLoading: false,
        });
      })
      .catch((err) => {
        errorLogger.warn('error with grabbing admin areas info', {
          component: 'ListDetails',
          action: 'getAdminAreasInfo',
          error: err,
        });
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Administrative Areas is not available',
          dialogContent: 'Analysis for this list is being processed. Please check again later.',
          isLoading: false,
        });
      });
  };

  getProtectedAreasInfo = () => {
    store.dispatch(updateListData([]));
    store.dispatch(updateFilteredData([]));
    store.dispatch(updateSelectedLocations([]));
    this.setState({ isLoading: true });
    fetch({
      url: '/locations/getProtectedAreasInfo',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((info) => {
        this.setState({
          pAreas: info,
          isLoading: false,
        });
      })
      .catch((err) => {
        errorLogger.warn('error with grabbing protected areas info', {
          component: 'ListDetails',
          action: 'getProtectedAreasInfo',
          error: err,
        });
        this.setState({
          dialogOpen: true,
          dialogTitle: 'Protected Areas is not available',
          dialogContent: 'Analysis for this list is being processed. Please check again later.',
          isLoading: false,
        });
      });
  };

  getAdministrativeAreasData = ({ filters, id, page = 0 }) => {
    const { tableSortedBy, tableSortedDesc, filterString } = this.state;
    this.setState({ isLoading: true });
    httpRequest
      .fetchJSON('/locations/getAdministrativeAreasData', {
        filters,
        filterString,
        id,
        pageNum: page,
        pageSize: 50,
        tableSortedBy,
        tableSortedDesc,
      })
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        const { numberOfPages, numberOfResults } = parsedResponse;
        this.setState({ numberOfPages, numberOfResults });
        this.processListData(parsedResponse);
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        errorLogger.warn('Error fetching admin areas data', {
          component: 'ListDetails',
          action: 'getAdminAreasData',
          error: err,
          filters,
          id,
          page,
        });
      });
  };

  getProtectedAreasData = ({ filters, id, page = 0 }) => {
    const { tableSortedBy, tableSortedDesc, filterString } = this.state;
    this.setState({ isLoading: true });
    httpRequest
      .fetchJSON('/locations/getProtectedAreasData', {
        filters,
        filterString,
        id,
        pageNum: page,
        pageSize: 50,
        tableSortedBy,
        tableSortedDesc,
      })
      .then((response) => {
        const parsedResponse = JSON.parse(response);
        const { numberOfPages, numberOfResults } = parsedResponse;
        this.setState({ numberOfPages, numberOfResults });
        this.processListData(parsedResponse);
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        errorLogger.warn('Error fetching protected areas data', {
          component: 'ListDetails',
          action: 'getProtectedAreasData',
          error: err,
          filters,
          id,
          page,
        });
      });
  };

  toggleReRunAnalysisDialog = () => {
    const { rerunDialogState } = this.state;
    this.setState({ rerunDialogState: !rerunDialogState });
  };

  handleDraftSubmit = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({ draftSubmitDialogOpen: true });
  };

  // Change the view that is shown - forest change, policy, commodity risk
  changeListView = (listView) => {
    const { listView: listViewProps, listData, selectedLists } = this.props;
    if (listView !== listViewProps) {
      const columnNames = getAllColumnNames(
        listView,
        listData[0],
        selectedLists,
        this.getCheckboxColumn,
        this.areAllAnalysesDraft(),
        this.state.forestDataset
      );

      // Preserve common (cross-tab) filters; clear tab-specific ones
      const currentFilters = store.getState().filters;
      const preservedFilters = {};
      COMMON_FILTER_KEYS.forEach((key) => {
        if (currentFilters[key] !== undefined) {
          preservedFilters[key] = currentFilters[key];
        }
      });

      const hasTabSpecificFilters = Object.keys(currentFilters).some(
        (key) =>
          !COMMON_FILTER_KEYS.includes(key) &&
          !isEqual(currentFilters[key], defaultFilterValues[key])
      );

      const newFilterCount = ['selectedCountry', 'selectedState', 'selectedSubState'].filter(
        (key) => !!preservedFilters[key]
      ).length;

      store.dispatch(changeListView(listView));
      store.dispatch(updateFilters(preservedFilters));
      store.dispatch(setFilterCount(newFilterCount));

      this.setState({
        numberOfResults: undefined,
        listColumns: columnNames.list.filter((c) => this.showListColumn(c)),
        combinedColumns: columnNames.combinedColumns,
        ...(hasTabSpecificFilters && {
          tabFiltersClearedNotification: true,
          tabFiltersClearedPrevTab: listViewProps,
        }),
      });
    }
  };

  loadLocationView() {
    const { selectedLists } = this.props;
    if (selectedLists.length > 0) {
      if (
        selectedLists[0].list_name ===
        gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.ADMINISTRATIVE_AREAS]
      ) {
        this.getAdministrativeAreasInfo();
      } else if (!selectedLists[0].isGlobalForestWatchList) {
        this.getUserLocationData(selectedLists[0].id);
      } else if (
        selectedLists[0].list_name === gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.PROTECTED_AREAS]
      ) {
        this.getProtectedAreasInfo();
      } else {
        this.getGFWLocationData(selectedLists[0].id);
      }
    } else {
      errorLogger.warn('attempting to load location view without a selected list', {
        component: 'ListDetails',
        action: 'getLocationData',
      });
    }
  }

  getAnalysisLastUpdatedDate(listAnalysesStatus, analysisIdOfCurrentTab) {
    const currentAnalysis = listAnalysesStatus?.find(
      (item) => item.analysisId === analysisIdOfCurrentTab
    );
    const updateTime = currentAnalysis?.updateTime;
    const rawAnalysisUpdated =
      window.Transifex?.live?.translateText?.('Analysis updated') ?? 'Analysis updated';
    const languageCode = window.Transifex?.live?.getSelectedLanguageCode?.() || 'en';
    const analysisUpdatedString =
      rawAnalysisUpdated !== 'Analysis updated'
        ? rawAnalysisUpdated
        : getManualTranslation('Analysis updated', languageCode);
    return updateTime ? (
      <>
        <span>{analysisUpdatedString}</span>
        <span>{`: ${formatDateForCurrentBrowserLanguage(updateTime)}`}</span>
      </>
    ) : (
      ''
    );
  }

  setIsDownloadDialogOpen = (value) => {
    this.setState({ isDownloadDialogOpen: value });
  };

  handleDownloadReport = (listID, listView) => {
    if (!DIAGNOSTICS_URLS[listView]) {
      return;
    }

    if (listView === ALERTS) {
      this.setState({ isAlertsDateSelectorOpen: true });
      return;
    }

    this.downloadReport(listID, listView);
  };

  handleAlertsDownloadReport = (listID, listView, date) => {
    this.downloadReport(listID, listView, date);
    this.setState({ isAlertsDateSelectorOpen: false });
  };

  downloadReport = async (listID, listView, date) => {
    if (!DIAGNOSTICS_URLS[listView]) {
      return;
    }

    try {
      this.setIsDownloadDialogOpen(true);
      let url = DIAGNOSTICS_URLS[listView].replaceAll('[list-id]', listID);

      if (date?.startDate && date?.endDate) {
        url = url.replace('[start-date]', date.startDate).replace('[end-date]', date.endDate);
      }

      await axios.get(url, {
        withCredentials: true,
      });
    } catch (error) {
      this.setIsDownloadDialogOpen(false);
      errorLogger.warn('Error downloading diagnostics', {
        component: 'ListDetails',
        action: 'downloadDiagnostics',
        error,
        listID,
        listView,
      });
    }
  };

  shouldShowAlertsUnsubscribeBanner(listAnalysesStatus) {
    // Check if list has ALERTS analysis
    const alertsAnalysis = listAnalysesStatus?.find(
      (item) => item.analysisId === 'ALERTS' || item.analysisId === 'Alerts'
    );

    // Banner should show if:
    // 1. List has Alerts analysis
    // 2. The options field exists and is explicitly not 'Weekly' (meaning it was unsubscribed)
    // Note: undefined/null options means the list is subscribed (legacy behavior before GPV-5142 migration)
    return alertsAnalysis && alertsAnalysis.options != null && alertsAnalysis.options !== 'Weekly';
  }

  render() {
    const {
      canopyModalVisible: isFilterModalVisible,
      currentUser,
      filterCount,
      filteredLocationData,
      listData,
      listView,
      selectedLists,
      selectedLocations,
      shareView,
      userSharedLists,
      showShareList,
    } = this.props;

    const {
      anchorElCountries,
      bannerContent,
      combinedColumns,
      currentFolder,
      dialogActions,
      dialogChildren,
      dialogContent,
      dialogOpen,
      dialogTitle,
      draftSubmitDialogOpen,
      filterValues,
      parentCompanyOptionsForFilter,
      supplierNameOptionsForFilter,
      secondSupplierNameOptionsForFilter,
      isLoading,
      isManageListFolderOpen,
      isNewListNameDuplicate,
      isNewListNameValid,
      listColumns,
      searchInputValue,
      filterString,
      listNotAccessible,
      isCountriesPopoverOpen,
      refreshPage,
      rerunDialogState,
      selectedMoveOrCopy,
      selectedNewOrExisting,
      newListName,
      showSubmitModal,
      page,
      tableSortedBy,
      tableSortedDesc,
      numberOfResults,
      visibleColumns,
      isEveryRowSelected,
      isListSubmittedForAnalysis,
      currentAdminAreas,
      pAreas,
      isFcdActive,
      isPalmRiskActive,
      isAfiActive,
      isGHGActive,
      isOnlyGHGActive,
      isDcfActive,
      staleAnalysisIds,
    } = this.state;

    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;
    const hasValidLocations =
      (selectedList?.list_locations_count ?? 0) > 0 && !selectedList?.error_file_storage_path;

    const listID = selectedList?.id;
    const countries = [...new Set(filteredLocationData.map((list) => list.Country))].sort();

    const listName = selectedList ? selectedList.list_name : '';
    const rawListAnalysesStatus = selectedList?.listAnalysesStatus ?? [];
    const { syntheticWeeklyEntry } = this.state;
    const listAnalysesStatus =
      syntheticWeeklyEntry &&
      !rawListAnalysesStatus.some((a) => a.analysisId === AlertsAnalysisFrequency.WEEKLY)
        ? [...rawListAnalysesStatus, syntheticWeeklyEntry]
        : rawListAnalysesStatus;

    const isGfwList = selectedList.isGlobalForestWatchList;

    const listViewOptions = [];

    const analysisMapping = {
      [FOREST_CHANGE_VIEW]: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
      [POST_2020_RISK_ASSESSMENT_VIEW]: analysisTypes.DEFORESTATION_KPIS,
      [COMMODITY_RISK_VIEW]: analysisTypes.PALM_RISK,
      [ALERTS]: analysisTypes.ALERTS,
    };

    const compareAnalysisStatus = (id, statusToCompareWith) =>
      listAnalysesStatus?.some(
        ({ analysisId, status }) => analysisId === id && status === statusToCompareWith
      );

    const analysisIdOfCurrentTab = analysisMapping[listView];

    const isAnalysisInProgress =
      compareAnalysisStatus(analysisIdOfCurrentTab, listStatus.Pending) ||
      isListSubmittedForAnalysis;

    const isAnalysisFailedByExceededAnalysisLimit = listAnalysesStatus?.find(
      ({ analysisId, status, errorInfo }) =>
        analysisId === analysisIdOfCurrentTab &&
        status === listStatus.Inactive &&
        errorInfo === 'Exceeded Analysis Limit'
    );

    const isFailedAnalysis =
      compareAnalysisStatus(analysisIdOfCurrentTab, listStatus.Inactive) &&
      !isAnalysisFailedByExceededAnalysisLimit;

    const locationDataIsNotAvailable = isFailedAnalysis;

    const isInFolder = selectedList && !!currentFolder;
    if (selectedList && currentFolder) {
      selectedList.folder = currentFolder;
    }

    const userIsOwner = currentUser.id === selectedList.user_id;

    const selectedListIsShared =
      selectedList &&
      userSharedLists &&
      userSharedLists.map((userSharedList) => userSharedList.id).includes(selectedList.id);

    // Viewers cannot move or copy any list
    const canMove = selectedList && currentUser.access_level_id !== userAccessLevel.VIEWER;

    // Admins can delete locations from any list.
    // Viewers cannot delete any locations.
    // Other roles (Editor) can only delete locations from lists they own, not shared lists.
    const canDelete =
      !isGfwList &&
      selectedList &&
      currentUser.access_level_id !== userAccessLevel.VIEWER &&
      (currentUser.access_level_id === userAccessLevel.ADMIN || !selectedListIsShared);

    if (isFcdActive || isGfwList) {
      listViewOptions.push(FOREST_CHANGE_VIEW);
    }
    if (isPalmRiskActive) {
      listViewOptions.push(COMMODITY_RISK_VIEW);
      if (!listAnalysesStatus?.some(({ analysisId }) => analysisId === 'PalmRisk')) {
        listAnalysesStatus.push({ analysisId: 'PalmRisk' });
      }
    }

    if (isAfiActive) {
      listViewOptions.push(POST_2020_RISK_ASSESSMENT_VIEW);
    }

    if (isDcfActive) {
      listViewOptions.push(ALERTS);
    }

    const allDialogActions = dialogActions || (
      <PillButton
        className="dialog__primary-action"
        variant="contained"
        color="primary"
        onClick={() => this.handleDialogClose(refreshPage)}
      >
        {locationsPage.lists.ok}
      </PillButton>
    );

    const isSharedList =
      selectedLists &&
      userSharedLists &&
      userSharedLists.map((userSharedList) => userSharedList.id).includes(selectedLists[0].id);

    const showMultipleSelectionBulkActions =
      selectedList && selectedLocations.length > 0 && !locationDataIsNotAvailable;

    const hasLocationWithErrors = listData.some(
      ({ location_status_id, analysisStatusId }) =>
        location_status_id === listStatus.Inactive || analysisStatusId === listStatus.Inactive
    );

    const isListDiagnosticButtonVisible =
      !getIsDraftWithoutDiagnostic(selectedList) &&
      listName !== gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.ADMINISTRATIVE_AREAS] &&
      listName !== gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.PROTECTED_AREAS] &&
      (isGfwList || getActiveAnalysisType(listAnalysesStatus)) &&
      selectedLocations?.length < 2 &&
      listView !== ALERTS;

    const locationsWithError = listData?.filter((x) => x.ErrorDetails);
    const carLastUpdateDate = JSON.parse(listData?.[0]?.attributes || '{}')?.['ID Updated Date'];

    const urlRegex = /^[^:]+:\/\/.+/;
    const isListWithErrors = urlRegex.test(selectedLists[0]?.error_file_storage_path);

    const diagnosticButtonLabel = selectedLocations?.length
      ? 'Location Diagnostic'
      : 'List diagnostic';

    const rawDiagnosticLabel =
      window.Transifex?.live?.translateText?.(diagnosticButtonLabel) ?? diagnosticButtonLabel;
    const diagnosticLang = window.Transifex?.live?.getSelectedLanguageCode?.() || 'en';
    const translatedDiagnosticButtonLabel =
      rawDiagnosticLabel !== diagnosticButtonLabel
        ? rawDiagnosticLabel
        : getManualTranslation(diagnosticButtonLabel, diagnosticLang);

    return (
      <>
        <div className="list-details">
          <RetirementBanner dismissible />

          {!isGfwList && (
            <>
              <ChangeTypeOfAnalysisModal
                listId={listID}
                listName={listName}
                listAnalysesStatus={listAnalysesStatus}
                setIsChangeTypeOfAnalysisModalOpen={(open) =>
                  this.setState({ isChangeTypeOfAnalysisModalOpen: open })
                }
                isChangeTypeOfAnalysisModalOpen={this.state.isChangeTypeOfAnalysisModalOpen}
                commodity={selectedList?.Commodity}
                isPalmRiskActive={isPalmRiskActive}
              />

              <AnalysisStatusBanners
                isDiagnosticStatusDraft={getIsDiagnosticStatusDraft(selectedLists[0])}
                hasLocationWithErrors={hasLocationWithErrors}
                openDraftSubmitDialog={() => this.setState({ draftSubmitDialogOpen: true })}
                toggleReRunAnalysisDialog={this.toggleReRunAnalysisDialog}
                isFailedAnalysis={isFailedAnalysis}
                isAnalysisFailedByExceededAnalysisLimit={isAnalysisFailedByExceededAnalysisLimit}
                isListSubmittedForAnalysis={isListSubmittedForAnalysis}
                isListWithErrors={isListWithErrors}
                isOnlyGHGActive={isOnlyGHGActive}
              />

              {staleAnalysisIds.length > 0 && (
                <StaleAnalysisBanner
                  onResubmit={() => this.setState({ draftSubmitDialogOpen: true })}
                />
              )}
            </>
          )}

          {bannerContent && (
            <Banner
              className="lists-banner"
              intent="positive"
              onBannerClose={() => this.setState({ bannerContent: '' })}
            >
              <span>{bannerContent}</span>
            </Banner>
          )}

          <CustomDialog
            open={dialogOpen}
            dialogTitle={dialogTitle}
            dialogMessage={
              dialogChildren ? (
                <CopyMoveModal
                  isGfwList={isGfwList}
                  newListName={newListName}
                  isNewListNameDuplicate={isNewListNameDuplicate}
                  isNewListNameValid={isNewListNameValid}
                  selectedLists={selectedLists}
                  locationsCount={isEveryRowSelected ? numberOfResults : selectedLocations.length}
                  selectedMoveOrCopy={selectedMoveOrCopy}
                  selectedNewOrExisting={selectedNewOrExisting}
                  setMoveOrCopy={this.setMoveOrCopy}
                  setNewOrExisting={this.setNewOrExisting}
                  updateNewListName={this.updateNewListName}
                  updateSelectedMove={this.updateSelectedMove}
                />
              ) : (
                dialogContent
              )
            }
            dialogActionConfirm={allDialogActions}
          />

          <CustomDialog
            open={showSubmitModal}
            closeAction={() => this.setState({ showSubmitModal: false })}
            dialogTitle="Confirm Submission"
            dialogMessage="Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete."
            dialogActionConfirm={this.moveSelectedLocations}
          />

          {listNotAccessible && (
            <FailedPopupDialog
              open={listNotAccessible}
              title={`${listName} diagnostic failed to load.`}
              message={
                <p>
                  Please contact the GFW Pro support team for help and additional information by
                  filling out this
                  <a
                    className="popup__link"
                    href="https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363"
                  >
                    support form
                  </a>
                  .
                </p>
              }
              onRequestClose={() => this.setState({ listNotAccessible: !listNotAccessible })}
              onOkButtonPress={() => (window.location = '/locations')}
            />
          )}

          <ModalLoader open={isLoading} />

          <section className="locations-body list-detail-page">
            {!isGfwList &&
              !this.state.isAlertsUnsubscribeBannerDismissed &&
              this.shouldShowAlertsUnsubscribeBanner(listAnalysesStatus) && (
                <AlertsUnsubscribeBanner
                  onDismiss={() => this.setState({ isAlertsUnsubscribeBannerDismissed: true })}
                />
              )}

            {selectedList && (
              <Stack
                sx={{ marginBottom: '15px', margin: 'auto', maxWidth: '100%' }}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <div>
                  <Stack alignItems="center" direction="row">
                    <a href="/locations">
                      <ArrowBack
                        sx={{
                          color: 'black',
                          marginRight: '10px',
                          fontSize: '25px',
                          marginTop: '3px',
                        }}
                      />
                    </a>
                    <span style={{ fontSize: '25px', textTransform: 'capitalize' }}>
                      {listName}
                    </span>
                    {listName ===
                      gfwListsNames[GFW_LISTS_NUMBER_CONSTANTS.ADMINISTRATIVE_AREAS] && (
                      <InfoBubble infoBubbleId={infoBubbleConfig.administrativeAreasProList} />
                    )}
                  </Stack>
                </div>
                <LocationsSummary
                  anchorElCountries={anchorElCountries}
                  countries={countries}
                  filterValues={filterValues}
                  listLocationsCount={numberOfResults}
                  selectedList={selectedList}
                  shareView={shareView}
                  isOpen={isCountriesPopoverOpen}
                  onOpen={this.openCountriesPopover}
                  onClose={this.closeCountriesPopover}
                  numberOfResults={numberOfResults}
                />
              </Stack>
            )}

            <div className="flex-grid">
              <section className="list-details-container">
                {isGHGActive && <GHGBanner />}

                {/* Shared lists view */}
                {shareView ? (
                  <>
                    {!locationDataIsNotAvailable && (
                      <div className="section-container">
                        <ShareList
                          key={selectedList.id}
                          currentUser={currentUser}
                          selectedList={selectedList}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <ListActions
                      currentUser={currentUser}
                      toggleReRunAnalysisDialog={this.toggleReRunAnalysisDialog}
                      rerunDialogState={rerunDialogState}
                      rerunList={this.rerunList}
                      isManageListFolderOpen={isManageListFolderOpen}
                      setIsManageListFolderOpen={(value) => {
                        this.setState({ isManageListFolderOpen: value });
                      }}
                      showShareList={showShareList}
                      handleDraftSubmit={(e) => this.handleDraftSubmit(e)}
                      draftSubmitDialogOpen={draftSubmitDialogOpen}
                      setDraftSubmitDialogOpen={(value) => {
                        this.setState({ draftSubmitDialogOpen: value });
                      }}
                      isListSubmittedForAnalysis={isListSubmittedForAnalysis}
                      setIsListSubmittedForAnalysis={(value) => {
                        this.setState({ isListSubmittedForAnalysis: value });
                      }}
                      isInFolder={isInFolder}
                      userIsOwner={userIsOwner}
                      setState={this.setState}
                      searchInputValue={searchInputValue}
                      handleSearchInputChange={this.handleSearchInputChange}
                      handleSearchInputKeyDown={this.handleSearchInputKeyDown}
                      handleSearchInputClick={this.handleSearchInputClick}
                      showMultipleSelectionBulkActions={showMultipleSelectionBulkActions}
                      canMove={canMove}
                      promptMoveSelectedLocations={this.promptMoveSelectedLocations}
                      canDelete={canDelete}
                      promptDeleteSelectedLocations={this.promptDeleteSelectedLocations}
                      listFilterStr={filterString}
                      tableSortedBy={tableSortedBy}
                      tableSortedDesc={tableSortedDesc}
                      visibleColumns={visibleColumns}
                      isLoading={(loading) => {
                        this.setState({ isLoading: loading });
                      }}
                      isOnlyGHGActive={isOnlyGHGActive}
                      isEveryRowSelected={isEveryRowSelected}
                      userSharedLists={userSharedLists}
                      isDraftWithoutDiagnostic={
                        !isListWithErrors &&
                        !isOnlyGHGActive &&
                        ((getIsDiagnosticStatusDraft(selectedLists[0]) &&
                          !isListSubmittedForAnalysis) ||
                          isAnalysisFailedByExceededAnalysisLimit)
                      }
                    />

                    {/* Rendered only if there's a carLastUpdateDate */}
                    <CARAccordion carLastUpdateDate={carLastUpdateDate} />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {!this.areAllAnalysesDraft() && listView && (
                        <AnalysesTabs
                          listViewOptions={listViewOptions}
                          listView={listView}
                          changeListView={this.changeListView}
                          listAnalysesStatus={listAnalysesStatus}
                          hasLocationWithErrors={hasLocationWithErrors}
                          staleAnalysisIds={staleAnalysisIds}
                        />
                      )}

                      {!isGfwList && hasValidLocations && (
                        <MaterialButton
                          style={{ color: '#97bd3d', fontSize: '12px' }}
                          onClick={() => {
                            this.setState({ isChangeTypeOfAnalysisModalOpen: true });
                          }}
                        >
                          CHANGE ANALYSES
                        </MaterialButton>
                      )}
                    </div>

                    <Paper sx={{ padding: '12px', borderTopLeftRadius: '0px' }}>
                      {locationDataIsNotAvailable && (
                        <AnalysisFailedMessage
                          toggleReRunAnalysisDialog={this.toggleReRunAnalysisDialog}
                        />
                      )}

                      {isAnalysisInProgress && <AnalysisInProgressMessage />}
                      {!locationDataIsNotAvailable && !isAnalysisInProgress && (
                        <>
                          <div className="list-analysis-actions">
                            {isListDiagnosticButtonVisible && (
                              <MaterialButton
                                className="list-analysis-actions__diagnostic-button"
                                sx={{
                                  color: '#97bd3d',
                                  border: '1px solid #97bd3d',
                                  borderRadius: '50px',
                                  '&:hover': {
                                    backgroundColor: 'rgba(151, 189, 61, 0.2)',
                                  },
                                }}
                                data-cy={
                                  selectedLocations?.length
                                    ? 'location-diagnostics'
                                    : 'list-diagnostics'
                                }
                                onClick={() => this.viewDiagnostic()}
                                startIcon={<QueryStats />}
                              >
                                {translatedDiagnosticButtonLabel}
                              </MaterialButton>
                            )}
                            <div>
                              {listView !== COMMODITY_RISK_VIEW && (
                                <MaterialButton
                                  className="list-analysis-actions__download-reports-button"
                                  data-cy="download-reports-button"
                                  startIcon={<Download />}
                                  onClick={() => this.handleDownloadReport(listID, listView)}
                                >
                                  {(() => {
                                    const raw =
                                      window.Transifex?.live?.translateText?.('Download Report') ??
                                      'Download Report';
                                    const lang =
                                      window.Transifex?.live?.getSelectedLanguageCode?.() || 'en';
                                    return raw !== 'Download Report'
                                      ? raw
                                      : getManualTranslation('Download Report', lang);
                                  })()}
                                </MaterialButton>
                              )}
                              <span className="list-analysis-actions__analysis-date">
                                {this.getAnalysisLastUpdatedDate(
                                  listAnalysesStatus,
                                  analysisIdOfCurrentTab
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Rendered only if there are locationsWithError */}
                          <LocationErrorsAlert
                            locationsWithError={locationsWithError}
                            onAddLocationsAgain={() =>
                              this.setState({ draftSubmitDialogOpen: true })
                            }
                          />

                          <Filter
                            filterCount={filterCount}
                            filterValues={filterValues}
                            parentCompanyOptionsForFilter={parentCompanyOptionsForFilter}
                            supplierNameOptionsForFilter={supplierNameOptionsForFilter}
                            secondSupplierNameOptionsForFilter={secondSupplierNameOptionsForFilter}
                            listColumns={listColumns}
                            visibleColumns={visibleColumns}
                            setListColumns={(newVisibleColumns) =>
                              this.setState({
                                visibleColumns: newVisibleColumns,
                              })
                            }
                            isFilterModalVisible={isFilterModalVisible}
                            listView={listView}
                            listName={listName}
                            adminAreas={currentAdminAreas}
                            protectedAreas={pAreas}
                            isGfwList={selectedList.isGlobalForestWatchList}
                            areAllAnalysesDraft={this.areAllAnalysesDraft()}
                            isListWithErrors={isListWithErrors}
                            forestDataset={this.state.forestDataset}
                            onForestDatasetChange={this.changeDataSource}
                          />

                          <section>
                            {filteredLocationData.length === 0 && !isLoading && (
                              <Grid
                                item
                                container
                                direction="column"
                                alignItems="center"
                                justifyContent="center"
                                textAlign="center"
                                sx={{ pb: 2 }}
                              >
                                <Box display="flex" alignItems="center" gap={1}>
                                  <NotListedLocation
                                    color="primary"
                                    sx={{
                                      fontSize: '25px',
                                    }}
                                  />
                                </Box>
                                <Typography variant="h5">No locations found.</Typography>

                                <Typography variant="body1">
                                  Adjust your filters or add locations to your list to get started
                                </Typography>
                              </Grid>
                            )}
                            {listView !== '' && filteredLocationData.length > 0 && !isLoading && (
                              <WrappedReactTable
                                listId={selectedLists[0].id}
                                isGfwList={isGfwList}
                                listView={listView}
                                isSharedList={isSharedList}
                                combinedColumns={combinedColumns}
                                numberOfPages={this.state.numberOfPages}
                                listColumns={listColumns}
                                visibleColumns={visibleColumns}
                                filteredLists={filteredLocationData}
                                page={page}
                                isUserList={!selectedLists[0].isGlobalForestWatchList}
                                getUserLocationData={this.getUserLocationData}
                                getFilteredGfwListData={this.getFilteredGfwListData}
                                tableSortedBy={tableSortedBy}
                                tableSortedDesc={tableSortedDesc}
                                setSortedBy={(tableSortedBy, tableSortedDesc) =>
                                  this.setState(
                                    {
                                      tableSortedBy,
                                      tableSortedDesc,
                                    },
                                    () => {
                                      this.getLocationsData(selectedLists[0].id, isGfwList, page);
                                    }
                                  )
                                }
                                viewDiagnostic={this.viewDiagnostic}
                                isDeleteButtonAvailable={canDelete}
                                promptDeleteSelectedLocations={this.promptDeleteSelectedLocations}
                                copyMoveAction={this.promptMoveSelectedLocations}
                                isCopyMoveActionAvailable={canMove}
                                currentUser={currentUser}
                                selectedList={selectedList}
                                setIsLoading={(loading) => {
                                  this.setState({ isLoading: loading });
                                }}
                              />
                            )}
                          </section>
                        </>
                      )}
                    </Paper>
                  </>
                )}
              </section>
            </div>
          </section>
        </div>
        <ConfirmDialog
          open={this.state.isDownloadDialogOpen}
          setDialogOpen={this.setIsDownloadDialogOpen}
        />
        <AlertsDateSelector
          isOpen={this.state.isAlertsDateSelectorOpen}
          onClose={() => this.setState({ isAlertsDateSelectorOpen: false })}
          onDownload={(date) => this.handleAlertsDownloadReport(listID, listView, date)}
        />
        <GDPRFooter variant="app" />
        <Snackbar
          open={this.state.tabFiltersClearedNotification}
          autoHideDuration={4000}
          onClose={() => this.setState({ tabFiltersClearedNotification: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => this.setState({ tabFiltersClearedNotification: false })}
            severity="info"
            variant="filled"
          >
            {`Filters specific to '${
              VIEW_LABELS[this.state.tabFiltersClearedPrevTab] ??
              this.state.tabFiltersClearedPrevTab
            }' have been reset for '${VIEW_LABELS[listView] ?? listView}'.`}
          </Alert>
        </Snackbar>
      </>
    );
  }
}
