import { Component } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Grid,
  Button as MaterialButton,
  Stack,
  Paper,
  Box,
  Alert,
  AlertTitle,
  Link,
  IconButton,
} from '@mui/material';
import Button from 'common/js/components/Button';
import {
  ArrowBack,
  DateRange,
  ExpandMore,
  Close,
  NotListedLocation,
  QueryStats,
} from '@mui/icons-material';
import CustomDialog from 'common/js/components/CustomDialog/CustomDialog';
import { maxLocations } from 'locations/js/utils/upload.utils';
import LinkButton from 'common/js/components/LinkButton';
import ModalLoader from 'common/js/components/Loaders/ModalLoader';
import AnalysesTabs from './AnalysesTabs';
import getUserLocationDataFromAPI from '../getUserLocationDataFromAPI';
import filterListData from '../filterListData';
import Filter from './Filter';
import { saveGfwListLocations } from '../../../utils/moveLocations';
import LocationDataNotAvailableMessage from '../LocationDataNotAvailableMessage';
import store from '../../../../../locations/js/store';
import { locationsPage, userAccessLevel } from '../../../../../common/js/config';
import {
  addList,
  changeListView,
  changeView,
  clearFilters,
  selectFolder,
  setFilterCount,
  toggleCanopyModal,
  updateFilteredData,
  updateListData,
  updateListLevelAnalysis,
  updateSelectedLocations,
} from '../../../../../locations/js/actions/locationActions';
import LocationsSummary from './LocationsSummary';
import SaveAsDraftButton from '../../../../../common/js/components/SaveAsDraft/SaveAsDraftButton';
import CopyMoveModal from '../../modals/CopyMoveModal';
import fetch from '../../../../../common/js/utils/fetch';
import httpRequest from '../../../../../common/js/utils/httpRequest';
import Banner from '../../../../../common/js/components/Banners/Banner';
import InfoBubble from '../../../../../common/js/components/InfoBubble';
import infoBubbleConfig from '../../../../../common/js/infoBubbleConfig.constants';
import {
  checkColumnListDraftList,
  isHiddenColumnInPost2020riskTable,
  checkColumnListCR,
  checkColumnListFC,
  checkColumnListGFWCR,
  checkColumnListGFWFC,
  checkColumnListPA,
  getListFilteredLocations,
  dataCleanup,
  containsPunctuation,
  checkValidViewCommodity,
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
import { deleteAllFilteredLocations } from '../deleteAllFilteredLocations';
import ChangeTypeOfAnalysisModal from '../../../../../locations/js/components/landing/listItem/ChangeTypeOfAnalysisModal';
import getActiveAnalysisType from '../../../../../../utils/getActiveAnalysisType';
import ListActions from './ListActions';
import { formatDateForCurrentBrowserLanguage } from '../../../../../common/js/utils/format';
import WrappedReactTable from './WrappedReactTable';
import AnalysisStatusBanners from './AnalysisStatusBanners';
import AnalysisFailedMessage from './AnalysisFailedMessage';
import AnalysisInProgressMessage from './AnalysisInProgressMessage';
import GHGBanner from './GHGBanner';
import { getActiveAnalysisFlags } from '../../../utils/listDetails.utils';
import { ThemeProvider } from '../../../../../styles/ThemeProvider';

// CONSTANTS
import { defaultMaximumAreaSizeForLocationsFilter } from '../../../../../common/js/constants/lists.constants';
import { listStatus } from '../../../../../../config/env/listStatuses.constants';
import {
  GFW_LISTS_NUMBER_CONSTANTS,
  gfwListsNames,
} from '../../../../../../config/env/gfwLists.constants';
import { getListFilterValues } from '../getListFilterValues';
import getAllColumnNames from '../getAllColumnNames';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import {
  FOREST_CHANGE_VIEW,
  COMMODITY_RISK_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
} from './listViews.constants';

// STYLE
import '../../../../../locations/css/lists.scss';
import '../../../../../locations/css/locations.scss';
import '../../../../../locations/css/react-table.scss';
import './ListDetails.scss';
import { PillButton } from '../../../../../components';
import { ExternalLinks } from '../../../../../utils/constants';

const EUDR_BANNER_KEY = 'GFW-is-eudr-banner-dismissed';
export default class ListDetails extends Component {
  constructor(props) {
    super(props);

    const { selectedLists } = this.props;
    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;
    const listAnalysesStatus = selectedList ? selectedList.listAnalysesStatus : [];
    // Adding PalmRisk analysis to pre selected analys
    listAnalysesStatus?.forEach(({ analysisId, options }) => {
      if (analysisId === 'FCD' && options === 'PalmRisk') {
        listAnalysesStatus.push({ analysisId: 'PalmRisk' });
      }
    });
    const { isFcdActive, isPalmRiskActive, isAfiActive, isGHGActive, isOnlyGHGActive } =
      getActiveAnalysisFlags(listAnalysesStatus);

    const isEudrBannerDismissed = !!localStorage.getItem(EUDR_BANNER_KEY);

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

      openCountriesPopover: false,
      dialogOpen: false,
      rerunDialogState: false,
      currentAdminAreas: [], // adminAreas
      pAreas: [],
      currentFolder: selectedLists.length ? selectedLists[0].folder : null,
      isLoading: !!selectedLists.length,
      isManageListFolderOpen: false,
      searchedLocations: [],
      selectedMoveOrCopy: 'copy',
      selectedNewOrExisting: 'existing',
      newListName: '',
      isNewListNameDuplicate: false,
      isNewListNameValid: false,
      refreshPage: false,
      draftSubmitDialogOpen: false,
      isSaveAsDraft: false,
      showSubmitModal: false,
      page: 0,
      numberOfPages: 1,
      maximumAnalysisAreaInTheList: defaultMaximumAreaSizeForLocationsFilter,
      isEveryRowSelected: false,
      filterValues: [],
      parentCompanyOptionsForFilter: [],
      supplierNameOptionsForFilter: [],
      secondSupplierNameOptionsForFilter: [],
      tableSortedBy: 'Location Name',
      tableSortedDesc: false,
      numberOfResults: undefined,
      visibleColumns: [],
      isChangeTypeOfAnalysisModalOpen: false,
      isListSubmittedForAnalysis: false,
      isFcdActive,
      isPalmRiskActive,
      isAfiActive,
      isGHGActive,
      isOnlyGHGActive,
      isEudrBannerDismissed,
    };
  }

  componentDidMount() {
    const { listData, filters, selectedLists } = this.props;
    const { list_name, id, isGlobalForestWatchList, associated_gfwlist } = selectedLists[0];

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

    // post-2020 risk assesment tab is selected by default, but
    // if that analysis is not active and post-2000 tree cover loss analysis is active,
    // then select the tab and change the view to FOREST_CHANGE_VIEW
    const listAnalysesStatus = selectedLists[0]?.listAnalysesStatus || [];

    const isPost2020RiskActive = listAnalysesStatus?.some(
      ({ analysisId }) => analysisId === analysisTypes.DEFORESTATION_KPIS
    );

    const isPost2000TreeCoverLossActive = listAnalysesStatus?.some(
      ({ analysisId }) => analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS
    );

    if ((!isPost2020RiskActive && isPost2000TreeCoverLossActive) || isGlobalForestWatchList) {
      store.dispatch(changeListView(FOREST_CHANGE_VIEW));
    }
  }

  // When a list is selected update state
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { gfwInfoFromMapNext, userListInfoFromMapNext } = nextProps;
    const { gfwInfoFromMap, gfwLists, userListInfoFromMap, userLists } = this.props;

    if (gfwInfoFromMapNext && !gfwInfoFromMap) {
      /**
       * @desc Executes when GFW list is selected
       */
      const gfwList = gfwLists.filter((list) => list.list_name === gfwInfoFromMapNext.listAlias)[0];
      store.dispatch(addList(gfwList));
      this.getGFWDataFromMap(gfwList, gfwInfoFromMapNext.gfwData.globalIds);
    } else if (userListInfoFromMapNext && !userListInfoFromMap) {
      /**
       * @desc Executes when User list is selected
       */
      const userList = userLists.filter((item) => item.id === userListInfoFromMapNext.listID)[0];
      store.dispatch(addList(userList));
      this.getUserLocationData(userListInfoFromMapNext.listID);
    }
  }

  componentDidUpdate(prevProps) {
    const { listView, listData, selectedLists, filters } = this.props;
    if (listView !== prevProps.listView) {
      const columnNames = getAllColumnNames(
        listView,
        listData[0],
        selectedLists,
        this.getCheckboxColumn,
        this.areAllAnalysesDraft()
      );
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
    const { filters } = this.props;
    const { filterString } = this.state;

    this.handleDialogClose(false);
    // clear the custom dialog buttons
    this.setState({
      dialogActions: null,
      isLoading: true,
    });
    const selectedList = selectedLists[0];
    const { id: list_id, list_name: listName } = selectedList;

    httpRequest
      .fetchJSON('/locations/lockList', { list_id })
      .then(() => {
        deleteAllFilteredLocations(list_id, filters, filterString)
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
              console.warn('Got unrecognized location delete response', response);
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
            console.log('DeleteList action error', err);
          });
      })
      .catch((err) => {
        console.error(err);
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
      console.warn('Attempting to delete locations without selecting any');
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
            console.warn('Got unrecognized location delete response', response);
            this.setState({
              dialogOpen: true,
              dialogTitle: locationsPage.lists.deleteLocationsMessages.error.title,
              dialogContent: locationsPage.lists.deleteLocationsMessages.error.message,
              isLoading: false,
            });
          }
        })
        .catch((err) => {
          console.error(err);
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
          <Button
            className="dialog__primary-action"
            variant="primary"
            label={locationsPage.lists.ok}
            onClick={this.deleteSelectedLocations}
          />
          <LinkButton onClick={this.cancelDialog} label={locationsPage.lists.cancel} />
        </>
      ),
      dialogOpen: true,
      dialogTitle: locationsPage.lists.deleteLocationsMessages.confirm.title,
      dialogContent: locationsPage.lists.deleteLocationsMessages.confirm.message,
    });
  };

  handleMoveError = (moveError) => {
    console.warn('locations move/copy failed with error', moveError);
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
  moveSelectedLocations = () => {
    this.handleDialogClose(false);
    // clear the custom dialog content
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
      console.warn('Attempting to move locations without selecting any');
      return;
    }

    // Full location objects for selected locations
    const locationData = filteredLocationData.filter((location) => {
      return selectedLocations.indexOf(location.location_id) > -1;
    });

    locationData.sort((a, b) => a.location_id - b.location_id);

    const userListNames = userLists.map((userList) => userList.list_name.toLowerCase());
    const selectedList = selectedLists[0];

    const moveToList =
      selectedNewOrExisting === 'existing'
        ? userLists.find((userList) => userList.list_name === selectedListMove)
        : null;

    this.setState({
      isLoading: true,
    });

    const list_id = selectedList.id;

    const destinationListName = moveToList?.list_name || newListName;

    if (!selectedList.isGlobalForestWatchList) {
      httpRequest.fetchJSON('/locations/lockList', { list_id }).then(() => {
        const { associated_gfwlist } = moveToList || selectedList;
        const gfw_list_id =
          associated_gfwlist === 'null' || !associated_gfwlist ? 0 : associated_gfwlist;
        const myFilters = {
          analysisAreaMin: filters.selectedAreaMin || 0,
          ...(filters.selectedAreaMax ? { analysisAreaMax: filters.selectedAreaMax } : {}),
          ...(filters.selectedCountry ? { country: filters.selectedCountry } : {}),
          ...(filters.selectedState ? { state: filters.selectedState } : {}),
          ...(filters.selectedSubState ? { subState: filters.selectedSubState } : {}),
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

        new Promise((resolve) => {
          fetch({
            url: `locations/cm-large-list`,
            method: 'POST',
            headers: {
              'Content-type': 'application/json',
            },
            body: copyLocationsRequestBody,
          })
            .then(() => {
              resolve({
                dialogTitle: 'Locations Moved',
                dialogContent:
                  'Location move process starts, this can take a while, please be patient.',
              });
            })
            .catch((error) => {
              console.warn(`/locations/cm-large-list`, error);
              resolve({
                dialogTitle: 'Something Went Wrong',
                dialogContent: 'An error ocurred while processing your request.',
              });
            });
        }).then(({ dialogTitle, dialogContent }) => {
          this.setState({
            dialogOpen: true,
            refreshPage: true,
            isLoading: false,
            dialogTitle,
            dialogContent,
          });
        });
      });
    } else {
      const result = saveGfwListLocations(
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

      result.then(
        (response) => {
          // locations copy/move has finished
          if (
            Object.prototype.hasOwnProperty.call(locationsPage.lists.copyMoveMessages, response)
          ) {
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
            console.warn('locations move/copy completed with unrecognized response', response);
            this.setState({
              dialogOpen: true,
              dialogTitle: locationsPage.lists.copyMoveMessages.serverError.title,
              dialogContent: locationsPage.lists.copyMoveMessages.serverError.message,
              refreshPage: true,
              isLoading: false,
            });
          }
        },
        (moveError) => {
          this.handleMoveError(moveError);
        }
      );
    }
  };

  setMoveOrCopy = (evt) => {
    const { selectedNewOrExisting } = this.state;
    const selectedMoveOrCopy = evt.target.value;
    // The API doesn't support moving to a new list, only copying, so we auto-select the 'existing' option if the user
    // chooses to move.
    this.setState({
      selectedMoveOrCopy,
      selectedNewOrExisting: selectedMoveOrCopy === 'move' ? 'existing' : selectedNewOrExisting,
      dialogChildren: true,
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
    const { selectedLocations, selectedMoveOrCopy, selectedLists } = this.props;
    const { isOnlyGHGActive } = this.state;

    const isGfwList = selectedLists[0]?.isGlobalForestWatchList;
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
      this.setState({
        dialogActions: (
          <>
            <SaveAsDraftButton
              onClick={() => {
                this.setState({ isSaveAsDraft: true }, () => {
                  if (selectedMoveOrCopy === 'copy') {
                    gtag('event', 'Copy List', {
                      event_category: 'Copy',
                      event_label: 'User copies a list to draft',
                    });
                  } else {
                    gtag('event', 'Move List', {
                      event_category: 'Move',
                      event_label: 'User moves a list to draft',
                    });
                  }
                  this.moveSelectedLocations();
                });
              }}
              disabled={
                selectedNewOrExisting === 'new' &&
                (!newListName || isNewListNameDuplicate || isNewListNameValid)
              }
            />
            <Button
              className="dialog__primary-action"
              variant="primary"
              label={locationsPage.lists.submit}
              onClick={() => {
                if (selectedMoveOrCopy === 'copy') {
                  gtag('event', 'Copy List', {
                    event_category: 'Copy',
                    event_label: 'User copies a list and submits',
                  });
                } else {
                  gtag('event', 'Move List', {
                    event_category: 'Move',
                    event_label: 'User moves a list and submits',
                  });
                }
                this.setState({ isSaveAsDraft: false, showSubmitModal: true });
              }}
              disabled={
                isOnlyGHGActive &&
                selectedNewOrExisting === 'new' &&
                (!newListName || isNewListNameDuplicate || isNewListNameValid)
              }
            />

            <LinkButton onClick={this.cancelDialogResetName} label={locationsPage.lists.cancel} />
          </>
        ),
        dialogOpen: true,
        dialogTitle: isGfwList
          ? locationsPage.lists.copyLocationsDialogHeader
          : locationsPage.lists.moveLocationsDialogHeader,
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
          <div className="column-checkbox-container">
            <input
              id="column-checkbox-all"
              className="column-checkbox"
              type="checkbox"
              checked={isEveryRowSelected}
              onChange={this.selectAllLocations}
            />
            <label htmlFor="column-checkbox-all" className="column-checkbox" />
          </div>
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
          <div>
            <input
              id={`list${cellProps.original.list_id}-location${cellProps.original.location_id}`}
              className="column-checkbox"
              checked={selectedLocations.indexOf(cellProps.original.location_id) !== -1}
              onChange={() => this.setLocationCheckbox(cellProps.original.location_id)}
              type="checkbox"
            />
            <label
              htmlFor={`list${cellProps.original.list_id}-location${cellProps.original.location_id}`}
              className="column-checkbox column-checkbox-single"
            />
          </div>
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
          this.areAllAnalysesDraft()
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
        console.warn('error with grabbing GFW List location data', err);
        this.setState({ isLoading: false });
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
        stopLoading();
      });
  };

  /**
   * Send a request to the backend to grab selected user lists
   * @param {String} list_id - ID of list.
   * @param {Integer} page - page number.
   */

  areAllAnalysesDraft = () => {
    const { selectedLists } = this.props;
    const { isOnlyGHGActive } = this.state;
    const listAnalysesStatus = selectedLists[0]?.listAnalysesStatus || [];

    // also true if there are no analyses selected
    const areAllAnalysesDraft = listAnalysesStatus.every(
      (item) => item.status === listStatus.Draft
    );
    return (isOnlyGHGActive || areAllAnalysesDraft) && !selectedLists[0].isGlobalForestWatchList;
  };

  getUserLocationData = (list_id, page = 0) => {
    const { filters, stopLoading } = this.props;
    const { tableSortedBy, tableSortedDesc, filterString } = this.state;

    this.setState({ page, isLoading: true });

    getUserLocationDataFromAPI(
      filters,
      list_id,
      filterString,
      tableSortedBy,
      tableSortedDesc,
      page,
      this.areAllAnalysesDraft()
    )
      .then((response) => {
        const {
          list_analysis,
          location_analyses,
          numberOfPages,
          maximumAnalysisAreaInTheList,
          numberOfResults,
        } = response;
        const listData = {
          list_analysis,
          location_analyses: [location_analyses, location_analyses],
        };

        this.setState({
          numberOfPages,
          numberOfResults,
          maximumAnalysisAreaInTheList,
        });

        this.processListData(listData);
      })
      .catch((err) => {
        console.warn('err', err);
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
        console.warn('err', err);
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

    if (newValue === '' && filterString !== '') {
      // if there was a filter string set and we cleared the input text

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
    const { selectedLists, filterString } = this.props;
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

  toggleCountriesPopover = (event) => {
    event.preventDefault();

    this.setState({
      openCountriesPopover: true,
      anchorElCountries: event.currentTarget,
    });
  };

  closeCountriesPopover = () => {
    this.setState({
      openCountriesPopover: false,
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
    } = firstElem; // hard coding this will cause me trouble with Lucas

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
        console.warn('Error when re-running a list', err);
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
        console.warn('error with grabbing admin areas info', err);
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
        console.warn('error with grabbing protected areas info', err);
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
        console.warn('error with grabbing admin areas data', err);
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
        console.warn('error with grabbing protected areas data', err);
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
        this.areAllAnalysesDraft()
      );
      store.dispatch(changeListView(listView));
      this.clearFilters();
      this.setState({
        listColumns: columnNames.list.filter((c) => this.showListColumn(c)),
        combinedColumns: columnNames.combinedColumns,
      });
    }
  };

  changeFolderView(folder) {
    const { showShareList } = this.props;
    showShareList(false);
    store.dispatch(selectFolder(folder));
    store.dispatch(changeView('folders'));
  }

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
      console.warn('attempting to load location view without a selected list');
    }
  }

  getAnalysisLastUpdatedDate(listAnalysesStatus, analysisIdOfCurrentTab) {
    const currentAnalysis = listAnalysesStatus?.find(
      (item) => item.analysisId === analysisIdOfCurrentTab
    );
    const updateTime = currentAnalysis?.updateTime;
    const analysisUpdatedString = Transifex.live.translateText('Analysis updated');
    return updateTime ? (
      <>
        <span>{analysisUpdatedString}</span>
        <span>{`: ${formatDateForCurrentBrowserLanguage(updateTime)}`}</span>
      </>
    ) : (
      ''
    );
  }

  formatDateToCarMessage = (carDateString) => {
    try {
      const [year, month, day] = carDateString.split('-').map(Number);
      const carDate = new Date(year, month - 1, day);
      const userLang = navigator.language || navigator.languages[0];
      const formattedDate = new Date(carDate).toLocaleDateString(userLang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return formattedDate;
    } catch {
      console.error('Error converting the date: ', carDateString);
      return 'N/A';
    }
  };

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
      usersList,
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
      openCountriesPopover,
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
    } = this.state;

    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;

    const listID = selectedList?.id;
    const countries = [...new Set(filteredLocationData.map((list) => list.Country))].sort();

    const listName = selectedList ? selectedList.list_name : '';
    const listAnalysesStatus = selectedList?.listAnalysesStatus ?? [];

    const isGfwList = selectedList.isGlobalForestWatchList;

    const listViewOptions = [];

    const analysisMapping = {
      [FOREST_CHANGE_VIEW]: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
      [POST_2020_RISK_ASSESSMENT_VIEW]: analysisTypes.DEFORESTATION_KPIS,
      [COMMODITY_RISK_VIEW]: analysisTypes.PALM_RISK,
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
    const isPalmOilBackwardComp = checkValidViewCommodity(selectedLists?.[0], listData?.[0]);
    if (isPalmOilBackwardComp || isPalmRiskActive) {
      listViewOptions.push(COMMODITY_RISK_VIEW);
      if (!listAnalysesStatus?.some(({ analysisId }) => analysisId === 'PalmRisk')) {
        listAnalysesStatus.push({ analysisId: 'PalmRisk' });
      }
    }

    if (isAfiActive) {
      listViewOptions.push(POST_2020_RISK_ASSESSMENT_VIEW);
    }

    const allDialogActions = dialogActions || (
      <Button
        className="dialog__primary-action"
        variant="primary"
        label={locationsPage.lists.ok}
        onClick={() => this.handleDialogClose(refreshPage)}
      />
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
      selectedLocations?.length < 2;

    const locationsWithError = listData?.filter((x) => x.ErrorDetails);
    const carLastUpdateDate = JSON.parse(listData?.[0]?.attributes || '{}')?.['ID Updated Date'];

    const urlRegex = /^[^:]+:\/\/.+/;
    const isListWithErrors = urlRegex.test(selectedLists[0]?.error_file_storage_path);

    const diagnosticButtonLabel = selectedLocations?.length
      ? 'Location Diagnostic'
      : 'List diagnostic';

    const translatedDiagnosticButtonLabel = Transifex.live.translateText(diagnosticButtonLabel);

    return (
      <ThemeProvider>
        <div className="list-details">
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
                isPalmOilBackwardComp={isPalmOilBackwardComp}
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
                  Please select the list to try loading the diagnostic again. If diagnostic continue
                  to fail, email{' '}
                  <a className="popup__link" href="mailto:GFWPROsupport@wri.org">
                    GFWPROsupport@wri.org
                  </a>{' '}
                  for assistance.
                </p>
              }
              onRequestClose={() => this.setState({ listNotAccessible: !listNotAccessible })}
              onOkButtonPress={() => (window.location = '/locations')}
            />
          )}

          <ModalLoader open={isLoading} />

          <section className="locations-body list-detail-page">
            {!isGfwList && !this.state.isEudrBannerDismissed && (
              <Alert
                severity="info"
                action={
                  <IconButton
                    onClick={() => {
                      localStorage.setItem(EUDR_BANNER_KEY, 1);
                      this.setState({ isEudrBannerDismissed: true });
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                }
                sx={{
                  borderRadius: 1,
                  mb: 2,
                  alignItems: 'center',
                  border: (theme) => `1px solid ${theme.palette.secondary[300]}`,
                  backgroundColor: (theme) => theme.palette.secondary[100],
                  color: (theme) => theme.palette.secondary[900],
                  '& svg': {
                    color: (theme) => theme.palette.secondary[700],
                  },
                  '& .MuiAlert-message': {
                    display: 'flex',
                    gap: 0.5,
                  },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                  Looking for EUDR-related analyses?
                </Typography>
                <Typography variant="body1">
                  The Post-2020 Risk Assessment is recommended to support EUDR compliance.
                </Typography>
              </Alert>
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
                  closeCountriesPopover={this.closeCountriesPopover}
                  countries={countries}
                  filterValues={filterValues}
                  listLocationsCount={numberOfResults}
                  openCountriesPopover={openCountriesPopover}
                  selectedList={selectedList}
                  shareView={shareView}
                  toggleCountriesPopover={this.toggleCountriesPopover}
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
                          usersList={usersList}
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
                    {carLastUpdateDate && (
                      <Accordion
                        sx={{
                          mb: 1.5,
                          padding: 1.25,
                          borderRadius: 1,
                          boxShadow: 'none',
                          border: (theme) => `1px solid ${theme.palette.secondary[300]}`,
                          backgroundColor: (theme) => theme.palette.secondary[100],
                          color: (theme) => theme.palette.secondary[900],
                          '& .MuiBase-root, & .MuiButtonBase-root': {
                            minHeight: 0,
                            padding: 0,
                          },
                          '& .Mui-expanded': {
                            mb: 0.5,
                          },
                          '& .MuiAccordionSummary-content': {
                            margin: 0,
                          },
                          '& .MuiButtonBase-root.Mui-expanded .hide-when-expanded': {
                            display: 'none',
                          },
                          '& .MuiAccordionDetails-root': {
                            padding: 0,
                            mx: 3,
                            borderTop: (theme) => `1px solid ${theme.palette.secondary[300]}`,
                          },
                          '&::before': {
                            display: 'none',
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <ExpandMore sx={{ color: (theme) => theme.palette.secondary[700] }} />
                          }
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <DateRange
                            fontSize="small"
                            sx={{ mr: 1, color: (theme) => theme.palette.secondary[700] }}
                          />
                          <Typography variant="body2">
                            <b>CAR Data Recency</b>
                            <span className="hide-when-expanded">
                              <b>:</b> Expand to see instructions for assessing how up-to-date your
                              CAR polygon boundaries are.
                            </span>
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" sx={{ pt: 2 }}>
                            The most recent CAR dataset available on Pro was retrieved from SICAR
                            databases on {this.formatDateToCarMessage(carLastUpdateDate)}. If your
                            list's CAR locations show an "ID Data Updated" date before{' '}
                            {this.formatDateToCarMessage(carLastUpdateDate)}, you will need to
                            re-upload these locations if you want to ensure that they are using the
                            most up-to-date CAR polygon boundaries.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {!this.areAllAnalysesDraft() && (
                        <AnalysesTabs
                          listViewOptions={listViewOptions}
                          listView={listView}
                          changeListView={this.changeListView}
                          listAnalysesStatus={listAnalysesStatus}
                          hasLocationWithErrors={hasLocationWithErrors}
                        />
                      )}

                      {!isGfwList && (
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
                            <span className="list-analysis-actions__analysis-date">
                              {this.getAnalysisLastUpdatedDate(
                                listAnalysesStatus,
                                analysisIdOfCurrentTab
                              )}
                            </span>
                          </div>
                          {locationsWithError?.length > 0 && (
                            <Alert
                              variant="filled"
                              severity="error"
                              sx={{
                                backgroundColor: (theme) => theme.palette.error[100],
                                color: (theme) => theme.palette.error[700],
                              }}
                              action={
                                <PillButton
                                  variant="contained"
                                  color="info"
                                  sx={{ width: '240px', alignSelf: 'center' }}
                                  onClick={() => this.setState({ draftSubmitDialogOpen: true })}
                                >
                                  Add Locations again
                                </PillButton>
                              }
                            >
                              <AlertTitle>Location Errors</AlertTitle>
                              <Typography variant="body2">
                                <strong>
                                  {locationsWithError?.length}{' '}
                                  {locationsWithError?.length === 1 ? ' location' : ' locations'}
                                </strong>{' '}
                                couldn't be analyzed due to invalid data (based on the first 50 rows
                                in your list). Hover over each failed location in the table to view
                                specific errors. Fix errors offline, re-add locations to your list,
                                and resubmit for analysis. You can delete previously failed
                                locations if desired.{' '}
                                <Link
                                  href={ExternalLinks.UploadListHelpCenter}
                                  target="_blank"
                                  sx={{
                                    color: (theme) => theme.palette.error[700],
                                    textDecoration: 'underline',
                                  }}
                                >
                                  More details
                                </Link>
                              </Typography>
                            </Alert>
                          )}

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
                            {listView !== '' && filteredLocationData.length > 0 && (
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
                            <LocationDataNotAvailableMessage
                              list={selectedList}
                              isListSubmittedForAnalysis={isListSubmittedForAnalysis}
                            />
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
      </ThemeProvider>
    );
  }
}
