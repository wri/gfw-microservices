import React, { Component } from 'react';
import ReactTable from 'react-table';
import cloneDeep from 'lodash/cloneDeep';
import Dialog from 'material-ui/Dialog';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

// Configs
import { getFolders } from 'locations/js/components/landing/foldersApi';
import ManageListFolderDialog from 'locations/js/components/landing/ManageListFolderDialog';
import CustomDraftDialog from 'common/js/components/CustomDraftDialog/CustomDraftDialog';
import { maxLocations } from 'locations/js/utils/upload.utils';

import Breadcrumbs from 'common/js/components/Breadcrumbs';
import Button from 'common/js/components/Button';
import LinkButton from 'common/js/components/LinkButton';
import GfwSelect from 'common/js/components/GfwSelect';
import ModalLoader from 'common/js/components/Loaders/ModalLoader';
import InfoBubbleContent from 'common/js/components/InfoBubbleContent';
import IconButton from 'common/js/components/IconButton';
import IconTimes from 'common/js/components/icon/IconTimes';
import IconShare from 'common/js/components/icon/IconShare';
import IconRerun from 'common/js/components/icon/IconRerun';
import IconListAlt from 'common/js/components/icon/IconListAlt';
import IconGlobeAmericas from 'common/js/components/icon/IconGlobeAmericas';
import getUserLocationDataFromAPI from './getUserLocationDataFromAPI';
import filterListData from './filterListData';
import {
  filterValidCustom,
  filterValidTemplates,
  saveGfwListLocations,
} from '../../utils/moveLocations';
import store from '../../../../locations/js/store';
import { locationsPage, proLayers, userAccessLevel } from '../../../../common/js/config';
import {
  addList,
  changeListView,
  changeView,
  clearFilters,
  selectFolder,
  setFilterCount,
  toggleCanopyModal,
  updateFilteredData,
  updateFolders,
  updateListData,
  updateListLevelAnalysis,
  updateSelectedAndVisibleLocations,
  updateSelectedLocations,
} from '../../../../locations/js/actions/locationActions';
import ListTitle from './ListTitle';
import ListDownload from './download/ListDownload';
import SaveAsDraftButton from '../../../../common/js/components/SaveAsDraft/SaveAsDraftButton';
import CopyMoveModal from '../modals/CopyMoveModal';
import SharingList from './SharingList';
import ListsFilter from '../../../../locations/js/components/lists/ListsFilter';
import fetch from '../../../../common/js/utils/fetch';
import httpRequest from '../../../../common/js/utils/httpRequest';
import {
  UserListSidebarItemActive,
  UserListSidebarItemAnalyzing,
  UserListSidebarItemFailed,
  UserListSidebarItemDraft,
} from './UserListSidebarItems';
import Banner from '../../../../common/js/components/Banners/Banner';
import {
  checkColumnListCR,
  checkColumnListFC,
  checkColumnListGFWCR,
  checkColumnListGFWFC,
  checkColumnListPA,
  checkValidView,
  checkValidViewCommodity,
  discernGfwID,
  getGFWListLocationIDs,
  getGfwListName,
  getListFilteredLocations,
  dataCleanup,
  getTemplateData,
  findArrIndex,
  isLocationDataNotAvailable,
  isAnalyzingStatus,
} from '../../../../locations/js/utils/lists.utils';

import {
  updateAddType,
  updateGFWListActiveTemplate,
  updateRegularListActiveTemplate,
} from '../../utils/lists-redux.utils';
import LargeListEditing from './EditList/LargeListEditing/LargeListEditing';
import { closePopover } from '../../../../locations/js/utils/togglePopover';
import ShareList from '../../../../locations/js/components/ShareList/ShareList';
import { EditList } from './EditList/EditList';
import redirectToPage from '../../../../common/js/utils/redirect';
import { FailedPopupDialog } from '../../../../locations/js/components/landing/FailedPopupDialog';
import { getIsDiagnosticStatusDraft } from '../../utils/draft.utils';
import { requestGeoTrellisAnalyzeList } from '../../../../locations/js/utils/request.utils';
import {
  getDialogContent,
  getDialogTitle,
} from '../../../../locations/js/utils/dialogMessage.utils';
import { deleteAllFilteredLocations } from './deleteAllFilteredLocations';
import LocationsTableColumnSelector from './LocationsTableColumnSelector';
import columns from '../../config/columns';
import { isUserList } from '../../../../common/js/utils/gfw.utils';
import { CommodityRiskFilterDrawer, ForestChangeFilterDrawer } from './Filters';
import LocationDataNotAvailableMessage from './LocationDataNotAvailableMessage';
import AnalysisListChips from '../../../../locations/js/components/landing/listItem/AnalysisListChips';
import ChangeTypeOfAnalysisModal from '../../../../locations/js/components/landing/listItem/ChangeTypeOfAnalysisModal';
import getActiveAnalysisType from '../../../../../utils/getActiveAnalysisType';

// CONSTANTS
import {
  gfwListNames,
  defaultMaximumAreaSizeForLocationsFilter,
} from '../../../../common/js/constants/lists.constants';
import { listStatus } from '../../../../../config/env/listStatuses.constants';
import { getListFilterValues } from './getListFilterValues';
import getAllColumnNames from './getAllColumnNames';
import featureFlags from '../../../../../utils/general.utils';

// STYLE
import '../../../../locations/css/lists.scss';
import '../../../../locations/css/locations.scss';
import '../../../../locations/css/react-table.scss';

const transifex = Transifex.live.translateText;

export default class Lists extends Component {
  unloadHistory = undefined;

  constructor(props) {
    super(props);

    const { selectedLists } = this.props;

    this.state = {
      bannerContent: '',
      commodityType: '',
      filterStringInputValue: '', // controlled text input value
      filterString: '', // filter string value
      listFilteredLocations: [],
      listNotAccessible: false,
      myListsSearchFilterSidebarString: '',
      hideCountry: true,
      hideTitle: true,
      listColumns: [],
      combinedColumns: [],
      openFlagMenu: false,
      openCountriesPopover: false,
      flagMenuInfo: {},
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
      refreshPage: false,
      draftSubmitDialogOpen: false,
      isSaveAsDraft: false,
      showSubmitModal: false,
      page: 0,
      numberOfPages: 1,
      maximumAnalysisAreaInTheList: defaultMaximumAreaSizeForLocationsFilter,
      allLocationsSelected: false,
      filterValues: [],
      tableSortedBy: 'Investment Name',
      tableSortedDesc: false,
      numberOfResults: undefined,
      displayLargeListEditingModal: false,
      visibleColumns: [],
      isChangeTypeOfAnalysisModalOpen: false,
    };
  }

  componentDidMount() {
    const { history, listData, filters, selectedLists } = this.props;
    window.scrollTo(0, 0);
    this.loadLocationView();
    this.unloadHistory = history.listen((location) => {
      const view = location.pathname.slice(1) ? location.pathname.slice(1) : 'landing';
      store.dispatch(changeView(view));
    });
    this.setAddTypeAndTemplate();

    filterListData(
      listData,
      filters,
      selectedLists[0],
      this.getAdministrativeAreasData,
      this.getProtectedAreasData
    );

    if (isUserList(selectedLists[0])) {
      getListFilterValues(selectedLists[0].id).then((filterValues) => {
        this.setState({ filterValues });
      });
    }
    store.dispatch(updateSelectedLocations([]));
    store.dispatch(updateSelectedAndVisibleLocations([]));
  }

  // When a list is selected update state
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { gfwInfoFromMapNext, viewNext, selectedListsNext, userListInfoFromMapNext } = nextProps;
    const { gfwInfoFromMap, gfwLists, userListInfoFromMap, userLists, view } = this.props;

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
    } else if (viewNext === 'lists' && view === 'landing' && selectedListsNext.length > 0) {
      this.loadLocationView();
    }
  }

  shouldComponentUpdate(nextProps) {
    const { view, listView } = this.props;
    if (view !== 'lists' && nextProps.view !== 'lists' && listView === nextProps.listView) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    const { listView, listData, selectedLists, filters } = this.props;
    if (listView !== prevProps.listView) {
      const columnNames = getAllColumnNames(
        listView,
        listData[0],
        selectedLists,
        this.getCheckboxColumn
      );
      this.setState({
        listColumns: columnNames.list.filter((c) => this.showListColumn(c)),
        combinedColumns: columnNames.combinedColumns,
      });
    }

    if (
      (selectedLists.length !== prevProps.selectedLists.length && selectedLists.length > 0) ||
      selectedLists !== prevProps.selectedLists
    ) {
      // if we didn't have a list selected and now we do
      // or we have selected a different list
      this.clearFilters();
      this.setState({ allLocationsSelected: false, filterValues: [] });

      if (isUserList(selectedLists[0])) {
        getListFilterValues(selectedLists[0].id).then((filterValues) => {
          this.setState({ filterValues });
        });
      }
    }

    const previousKeys = Object.keys(prevProps.filters);
    const currentKeys = Object.keys(filters);

    if (
      previousKeys.length !== currentKeys.length ||
      previousKeys.some((key) => filters[key] !== prevProps.filters[key])
    ) {
      // if the filters changed and this is a user list, get the paginated data from the API
      if (isUserList(selectedLists[0])) {
        this.getUserLocationData(selectedLists[0].id);
      } else {
        filterListData(
          listData,
          filters,
          selectedLists[0],
          this.getAdministrativeAreasData,
          this.getProtectedAreasData
        );
      }
    }
  }

  componentWillUnmount() {
    if (this.unloadHistory) {
      this.unloadHistory();
    }
  }

  // If given a filter's name and its current value, determine whether that filter is different than
  // the filter's preconfigured default value..
  isFilterValueDifferentThanDefault = ([filterName, val]) => {
    // It's the case that [] !== [], so we need special handling for arrays.
    if (Array.isArray(val)) {
      return val.toString() !== locationsPage.defaultFilterValues[filterName].toString();
    }
    return val !== locationsPage.defaultFilterValues[filterName];
  };

  // Creates List component for the left side menu
  createGFWLists = (list, index) => {
    const { selectedLists } = this.props;
    const { list_name, list_locations_count } = list;
    const isSelected = findArrIndex(selectedLists, 'list_name', list_name) !== -1;
    return (
      <UserListSidebarItemActive
        key={index}
        isSelected={isSelected}
        listName={list_name}
        locationCount={list_locations_count}
        onClick={() => this.updateSelectedLists(list.id, true)}
      />
    );
  };

  createUserLists = (list, index) => {
    const { selectedLists, currentUser } = this.props;
    const { list_name, list_locations_count, list_status_id } = list;
    const isSelected = findArrIndex(selectedLists, 'list_name', list_name) !== -1;

    let listItem;

    // Check for draft first
    if (getIsDiagnosticStatusDraft(list)) {
      listItem = (
        <UserListSidebarItemDraft
          key={index}
          isSelected={isSelected}
          listName={list_name}
          locationCount={list_locations_count}
          selectedList={list}
          currentUser={currentUser}
          onClick={() => this.updateSelectedLists(list.id, false)}
        />
      );
      return listItem;
    }

    switch (list_status_id) {
      case 1: // Analyzing
      case 5:
      case 6:
        listItem = (
          <UserListSidebarItemAnalyzing key={index} isSelected={isSelected} listName={list_name} />
        );
        break;
      case 2: // Active
        listItem = (
          <UserListSidebarItemActive
            key={index}
            isSelected={isSelected}
            listName={list_name}
            locationCount={list_locations_count}
            onClick={() => this.updateSelectedLists(list.id)}
          />
        );
        break;
      case 3: // Failed
        listItem = (
          <UserListSidebarItemFailed key={index} isSelected={isSelected} listName={list_name} />
        );
        break;
      default:
    }

    return listItem;
  };

  // Create Flag component to add/remove flags for a location
  createFlagList = (column, index) => {
    return (
      <div className="flag" key={index}>
        <input id={`flag-${index}`} type="checkbox" />
        <label htmlFor={`flag-${index}`}>{column.name}</label>
      </div>
    );
  };

  showDialogEdit = () => {
    this.setState({
      dialogOpen: true,
      dialogTitle: 'List is locked',
      dialogContent:
        'The list that you have selected is currently being edited by another user. Please try again later.',
    });
  };

  showGFWUnselectedDialog = () => {
    this.setState({
      dialogOpen: true,
      dialogTitle: 'No locations selected',
      dialogContent:
        'To add locations from a GFW List, you must first select the locations you wish to add.',
    });
  };

  handleDialogClose = (shouldRefresh) => {
    if (shouldRefresh) {
      window.location.reload();
    } else {
      this.setState({ dialogOpen: false });
    }
  };

  // reload the view with the new selected list
  updateSelectedLists = (listID, gfwList) => {
    const { selectedLists } = this.props;
    if (selectedLists[0].id !== listID) {
      this.setState({ isLoading: true });
      gtag('event', 'List in side panel clicked', {
        event_category: 'List View Click',
        event_label: `user clicked on ${listID}`,
      });
      window.location = `/list-details?id=${listID}${gfwList ? '&gfw=true' : ''}`;
    }
  };

  // Update flags that are selected/unselected
  updateFlag = () => {
    this.closeFlagMenu();
  };

  // Update how many locations are selected
  searchLocations = (location_id) => {
    const { selectedLocations, selectedAndVisibleLocations } = this.props;
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

    if (selectedAndVisibleLocations.includes(location_id)) {
      const removeLocationID = selectedAndVisibleLocations.filter((item) => item !== location_id);
      store.dispatch(updateSelectedAndVisibleLocations(removeLocationID));
    } else {
      const selectedAndVisibleLocationsClone = cloneDeep(selectedAndVisibleLocations);
      selectedAndVisibleLocationsClone.push(location_id);
      store.dispatch(
        updateSelectedAndVisibleLocations(selectedAndVisibleLocationsClone.sort((a, b) => a - b))
      );
    }

    gtag('event', 'Location checkbox clicked', {
      event_category: 'List View Click',
      event_label: 'user checked/unchecked a location in the list',
    });
  };

  // Select all locations in a list
  addAllSelectedLocations = (evt) => {
    const { selectedLocations, filteredData, filteredLocationData } = this.props;
    const { listFilteredLocations } = this.state;
    const allLocationsSelected = evt.target.checked;
    this.setState({
      allLocationsSelected,
      isLoading: true,
    });

    if (
      (!allLocationsSelected && selectedLocations.length === filteredData.length) ||
      (selectedLocations.length === listFilteredLocations.length &&
        listFilteredLocations.length !== 0)
    ) {
      store.dispatch(updateSelectedLocations([]));
      store.dispatch(updateSelectedAndVisibleLocations([]));
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
      store.dispatch(updateSelectedAndVisibleLocations(locationIDs));
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
    const list_id = selectedLists[0].id;

    httpRequest
      .fetchJSON('/locations/lockList', { list_id })
      .then(() => {
        deleteAllFilteredLocations(list_id, filters, filterString)
          .then((response) => {
            if (response === 'LocationDeleted') {
              this.setState({
                dialogOpen: true,
                dialogTitle: locationsPage.lists.deleteLocationsMessages.success.title,
                dialogContent: locationsPage.lists.deleteLocationsMessages.success.message,
                refreshPage: true,
                isLoading: false,
              });
              gtag('event', 'locations all deleted', {
                event_category: 'Lists Click',
                event_label: 'user deleted all locations from their own list',
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
    const { allLocationsSelected } = this.state;

    if (!selectedLists.length || !selectedLocations.length) {
      console.warn('Attempting to delete locations without selecting any');
      return;
    }

    // If we are deleting all locations...
    if (allLocationsSelected) {
      this.deleteList(selectedLists);
      return;
    }

    const listId = selectedLists[0].id;
    const gwfListId = selectedLists[0].associated_gfwlist;

    // Ensure list is unlocked before attempting to delete locations from it
    httpRequest.fetchJSON('/locations/lockList', { list_id: listId }).then(() => {
      httpRequest
        .fetchJSON('/locations/deleteLocations', {
          list_id: listId,
          location_ids: selectedLocations,
          gfw_list_id: gwfListId,
        })
        .then((response) => {
          if (response === 'LocationDeleted') {
            this.setState({
              dialogOpen: true,
              dialogTitle: locationsPage.lists.deleteLocationsMessages.success.title,
              dialogContent: locationsPage.lists.deleteLocationsMessages.success.message,
              refreshPage: true,
              isLoading: false,
            });
            gtag('event', 'locations deleted', {
              event_category: 'Lists Click',
              event_label: 'user deleted locations from their own list',
            });
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
      dialogActions: [
        <div className="PromptDeleteSelectedLocations dialog__footer">
          <Button
            variant="primary"
            label={locationsPage.lists.ok}
            onClick={this.deleteSelectedLocations}
          />
          <LinkButton onClick={this.cancelDialog} label={locationsPage.lists.cancel} />
        </div>,
      ],
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
    this.setState({ dialogActions: null, dialogChildren: null });
    const {
      activeTemplate,
      addType,
      filteredLocationData,
      selectedLists,
      filters,
      selectedLocations,
      templateData,
      userLists,
    } = this.props;
    const {
      commodityType,
      newListName,
      selectedMoveOrCopy,
      selectedNewOrExisting,
      selectedListMove,
      isSaveAsDraft,
      allLocationsSelected,
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

    const listTemplateFields = templateData.filter(
      (field) => field.template_id === selectedList.template_id
    );
    const destinationListName = moveToList?.list_name || newListName;

    if (!selectedList.globalForestWatchList) {
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
          selectedListLocationClasification: selectedList.location_classification,
          customAttributesNames: [],
          userListNames,
          action: selectedMoveOrCopy,
          listType: selectedNewOrExisting,
          listName: newListName,
          targetList: moveToList,
          selectedLocations,
          addType,
          activeTemplate,
          commodityType,
          templateData: listTemplateFields,
          saveAsDraft: isSaveAsDraft,
          gfwListId: gfw_list_id,
          allLocationsSelected,
          filters: myFilters,
        };

        httpRequest.fetchJSON('/locations/cm-large-list', copyLocationsRequestBody).then(
          () => {
            const dialogTitle = 'Locations Moved';
            const dialogContent =
              'Location move process starts, this can take a while, please be patient.';

            this.setState({
              dialogOpen: true,
              refreshPage: true,
              isLoading: false,
              dialogTitle,
              dialogContent,
            });
          },
          (moveError) => {
            this.handleMoveError(moveError);
          }
        );
      });
    } else {
      const result = saveGfwListLocations(
        selectedList,
        newListName,
        userListNames,
        userLists,
        selectedNewOrExisting,
        addType,
        activeTemplate,
        commodityType,
        templateData,
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
    this.setState({ newListName, isNewListNameDuplicate, dialogChildren: true });
    this.promptMoveSelectedLocations({ ...this.state, newListName, isNewListNameDuplicate });
  };

  // Prompt to move the locations currently selected in the list
  promptMoveSelectedLocations = ({
    newListName,
    isNewListNameDuplicate,
    selectedNewOrExisting,
  }) => {
    const { selectedLocations, selectedMoveOrCopy } = this.props;
    if (selectedLocations.length > maxLocations) {
      this.setState({
        dialogOpen: true,
        dialogTitle: locationsPage.lists.copyMoveMessages.ListTooLarge.title,
        dialogContent: locationsPage.lists.copyMoveMessages.ListTooLarge.message,
        isSaving: false,
        refreshPage: false,
      });
    } else {
      this.setState({
        dialogActions: [
          <div className="PromptMoveSelectedLocations dialog__footer">
            <div className="PromptMoveSelectedLocations__actions">
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
                  selectedNewOrExisting === 'new' && (!newListName || isNewListNameDuplicate)
                }
              />
              <Button
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
                  selectedNewOrExisting === 'new' && (!newListName || isNewListNameDuplicate)
                }
              />
            </div>
            <LinkButton onClick={this.cancelDialog} label={locationsPage.lists.cancel} />
          </div>,
        ],
        dialogOpen: true,
        dialogTitle: locationsPage.lists.moveLocationsDialogHeader,
        dialogContent: '',
        dialogChildren: true,
      });
    }
  };

  // Set checkbox column to select lists
  getCheckboxColumn = () => {
    return {
      Header: () => {
        const { allLocationsSelected } = this.state;
        return (
          <div className="column-checkbox-container">
            <input
              id="column-checkbox-all"
              className="column-checkbox"
              type="checkbox"
              checked={allLocationsSelected}
              onChange={this.addAllSelectedLocations}
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
              onChange={() => this.searchLocations(cellProps.original.location_id)}
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
    if (selectedLists.length > 0 && isUserList(selectedLists[0])) {
      return (
        !(listView === 'forest_change' && checkColumnListFC(column.accessor)) &&
        !(listView === 'commodity_risk' && checkColumnListCR(column.accessor))
      );
    }
    if (selectedLists.length > 0) {
      const { list_name } = selectedLists[0];
      return (
        !(listView === 'forest_change' && checkColumnListGFWFC(list_name, column.accessor)) &&
        !(listView === 'commodity_risk' && checkColumnListGFWCR(list_name, column.accessor)) &&
        !(listView === 'forest_change' && checkColumnListPA(list_name, column.accessor))
      );
    }
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

      if (selectedLists[0].list_name === 'Administrative Areas') {
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

      if (analysisData.length > 0) {
        let analysisList = [];
        if (
          selectedLists[0].list_name === 'Protected Areas' ||
          selectedLists[0].list_name === 'Administrative Areas'
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
  processListData = (listData, locationNameForGFW, userLocation) => {
    const { getCurrentLists, selectedLists, listView, userListInfoFromMap } = this.props;
    const { allLocationsSelected } = this.state;
    const { list_analysis, location_analyses } = listData;
    // Ignore the returned data if the list selection has changed since the request was made.
    const currentlySelectedLists = getCurrentLists();
    if (currentlySelectedLists !== selectedLists) {
      console.warn('list selection has changed since requesting data');
      return;
    }

    if (isAnalyzingStatus(selectedLists[0]?.list_status_id)) {
      this.setState({
        isLoading: false,
      });
      return;
    }

    if (location_analyses) {
      // TODO - Talk to Lucas/Patrick, we should not be deleting data that is needed for Edit Lists workflow
      // If you need to hide the column, use a different method then deleting key/value
      const locationData = location_analyses[0];
      const analysisData = location_analyses[1];
      if (locationData.length > 0) {
        const data = this.setListData(locationData, analysisData);
        const columnNames = getAllColumnNames(
          listView,
          locationData[0],
          selectedLists,
          this.getCheckboxColumn
        );
        const filteredIds = data.map((d) => d.location_id);
        store.dispatch(updateListData(data));
        store.dispatch(updateFilteredData(filteredIds));
        store.dispatch(updateListLevelAnalysis(list_analysis));

        // if the checkbox to select all locations is selected, check the checkbox from all rows
        if (allLocationsSelected) {
          store.dispatch(updateSelectedLocations(filteredIds));
        }

        this.setState({
          listColumns: columnNames.list.filter((c) => this.showListColumn(c)),
          combinedColumns: columnNames.combinedColumns,
          isLoading: false,
        });

        if (locationNameForGFW) {
          if (typeof locationNameForGFW === 'string') {
            data[0]['Investment Name'] = data[0]['Investment Name']
              ? data[0]['Investment Name']
              : locationNameForGFW;
            data[0]['Location Name'] = data[0]['Location Name']
              ? data[0]['Location Name']
              : locationNameForGFW;
          }

          const { location_id } = data[0];
          store.dispatch(updateSelectedLocations([location_id]));
          store.dispatch(changeView('gfw'));
          const { history } = this.props;
          history.push('/gfw');
        } else if (userLocation) {
          const location_id = userListInfoFromMap.locationID;

          const selectedFeat = data.filter((feat) => feat.location_id === location_id)[0];
          if (selectedFeat) {
            selectedFeat['Investment Name'] = selectedFeat['Investment Name']
              ? selectedFeat['Investment Name']
              : selectedFeat['Location Name'];
            selectedFeat['Location Name'] = selectedFeat['Location Name']
              ? selectedFeat['Location Name']
              : selectedFeat['Investment Name'];
          }

          store.dispatch(updateSelectedLocations([location_id]));
          this.editList();
        }
      } else {
        store.dispatch(updateListData([]));
        this.setState({
          dialogOpen: true,
          dialogTitle: 'No locations were returned',
          dialogContent: 'This query matched no records. Please alter your query.',
          listColumns: [],
          combinedColumns: [],
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

  discernGFWName = (locations) => {
    let locationName = false;
    const attrs = locations.location_analyses[0] ? locations.location_analyses[0][0] : null;
    locationName = attrs ? attrs['Location Name'] : false;

    return locationName;
  };

  getGFWDataFromMap = (gfwList, globalIds) => {
    const { stopLoading } = this.props;
    // Original check of `gfwList.id` was breaking GFW list ID 3 and cutting first character from string
    // If we are passing globalIds, they contain brackets ({}) that we removed using slice
    const updatedGlobalIds = [1, 2, 3].includes(gfwList.id)
      ? globalIds
      : globalIds.map((id) => id.slice(1, -1));
    const params = `list_id=${gfwList.id}&global_ids=["${updatedGlobalIds}"]`;
    httpRequest
      .fetchForm('/locations/getGFWListLocationsGlobalId', params)
      .then((response) => {
        const locations = JSON.parse(response);
        if (locations) {
          const locationName = this.discernGFWName(locations);
          this.processListData(locations, locationName);
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
  getUserLocationData = (list_id, page = 0) => {
    const { filters, userListInfoFromMap, stopLoading } = this.props;
    const { tableSortedBy, tableSortedDesc, filterString } = this.state;

    this.setState({ page, isLoading: true });

    getUserLocationDataFromAPI(filters, list_id, filterString, tableSortedBy, tableSortedDesc, page)
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

        if (!userListInfoFromMap) {
          this.processListData(listData, false);
        } else {
          this.processListData(listData, false, true);
          stopLoading();
        }
      })
      .catch((err) => {
        console.warn('err', err);
        this.setState({ isLoading: false });
        stopLoading();
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
      });
  };

  getGFWLocationData = (list_id) => {
    this.setState({ isLoading: true });
    fetch({
      url: '/locations/getGFWListLocationData',
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: {
        list_id,
      },
    })
      .then((response) => {
        this.processListData(response);
      })
      .catch((err) => {
        console.warn('err', err);
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
      });
  };

  setAddTypeAndTemplate = (currentSelectedList) => {
    const { activeTemplate, selectedLists, templateData: allTemplatesData } = this.props;
    const selectedList = currentSelectedList || selectedLists[0];

    const templateData = getTemplateData(allTemplatesData, selectedList);
    updateAddType(templateData, activeTemplate);

    if (templateData) {
      updateRegularListActiveTemplate(templateData);
    } else {
      const commodityType = updateGFWListActiveTemplate(selectedList);
      this.setState({ commodityType });
    }
  };

  editList = () => {
    const { selectedLists, currentUser, selectedLocations } = this.props;
    const { allLocationsSelected, numberOfPages } = this.state;
    const selectedList = selectedLists[0];
    if (selectedList.user_id) {
      // if all locations where selected and there is more than one page
      // follow large list editing workflow
      if (allLocationsSelected && numberOfPages > 1) {
        this.setState({
          displayLargeListEditingModal: true,
        });
      } else {
        const list_id = selectedList.id;
        this.setState({
          isLoading: true,
        });
        httpRequest
          .fetchJSON('/locations/lockList', { list_id })
          .then((response) => {
            const result = JSON.parse(response);
            if (result.isLocked && result.lock_user_id !== currentUser.id) {
              this.showDialogEdit();
              this.setState({
                isLoading: false,
              });
            } else {
              this.setAddTypeAndTemplate();
              store.dispatch(changeView('edit'));
              const { history } = this.props;
              history.push('/edit');
              gtag('event', 'Edit button clicked', {
                event_category: 'Lists Click',
                event_label: 'user clicked to enter edit list workflow',
              });
            }
          })
          .catch((err) => {
            console.warn('error with editing list', err);
          });
      }
    } else if (selectedLocations.length > maxLocations) {
      this.setState({
        dialogOpen: true,
        dialogTitle: locationsPage.lists.copyMoveMessages.ListTooLarge.title,
        dialogContent: locationsPage.lists.copyMoveMessages.ListTooLarge.message,
        isSaving: false,
        refreshPage: false,
      });
    } else if (selectedLocations.length > 0) {
      // we don't necessarily need a loader here; we aren't making a request, &
      // step 1 of 3 in the addFromGFW workflow does Not render all the table rows!
      store.dispatch(changeView('gfw'));
      const { history } = this.props;
      history.push('/gfw');
      gtag('event', 'Edit button clicked', {
        event_category: 'Lists Click',
        event_label: 'user clicked to enter add from gfw workflow',
      });
    } else {
      this.showGFWUnselectedDialog();
    }
  };

  viewDiagnostic = async (isSingleLocation) => {
    const { selectedLists, selectedLocations, userSharedLists } = this.props;

    const selectedListIsShared =
      selectedLists &&
      userSharedLists &&
      userSharedLists.map((userSharedList) => userSharedList.id).includes(selectedLists[0].id);

    const gfwList = !isUserList(selectedLists[0]) ? '&gfw=true' : '';
    const sharedList = selectedListIsShared ? '&shared=true' : '';
    const locationId = isSingleLocation ? `&locationId=${selectedLocations[0]}` : '';
    const diagnosticsType = getActiveAnalysisType(selectedLists[0]?.listAnalysesStatus);
    const diagnosticsParam = !gfwList && diagnosticsType ? `&type=${diagnosticsType}` : '';
    window.location.href = `/diagnostics?listId=${selectedLists[0].id}${gfwList}${locationId}${diagnosticsParam}${sharedList}`;
  };

  viewMap = ({ showFullListMap }) => {
    const {
      filteredData,
      listData,
      selectedLocations,
      selectedLists,
      filterCount,
      listView,
      filters,
      filteredLocationData,
    } = this.props;
    const { filterString, combinedColumns, allLocationsSelected } = this.state;
    let locationIds = [];
    const gfwList = getGfwListName(selectedLists);

    if (selectedLocations.length > 0) {
      // If the user has checked any checkboxes, we are using
      // those selections and ignoring any filters or search strings
      if (gfwList) {
        locationIds = listData
          .filter((d) => selectedLocations.indexOf(d.location_id) > -1)
          .map((location) => getGFWListLocationIDs(gfwList, location));
      } else {
        locationIds = selectedLocations;
      }
    } else if (filterCount > 0) {
      // The user has set some filters so we want to send along all of the filtered locations
      if (gfwList) {
        locationIds = filteredLocationData.map((location) =>
          getGFWListLocationIDs(gfwList, location)
        );
      } else {
        locationIds = filteredData;
      }
    } else if (filterString) {
      // the user has set a filter string, but no checkboxes are selected and there are no filters
      const normalizedFilterStr = filterString.toString().toLowerCase();
      if (gfwList) {
        locationIds = filteredLocationData
          .filter((e) => {
            const activeColumns = combinedColumns.filter(
              (v) => v.show && v.accessor !== 'checkbox' && v.accessor !== 'flags'
            );
            return (
              activeColumns
                .map(
                  (col) =>
                    e[col.accessor] &&
                    e[col.accessor].toString().toLowerCase().includes(normalizedFilterStr)
                )
                .filter((v) => v).length > 0
            );
          })
          .map((location) => getGFWListLocationIDs(gfwList, location));
      } else {
        locationIds = filteredLocationData
          .filter((e) => {
            const activeColumns = combinedColumns.filter(
              (v) => v.show && v.accessor !== 'checkbox' && v.accessor !== 'flags'
            );
            return (
              activeColumns
                .map(
                  (col) =>
                    e[col.accessor] &&
                    e[col.accessor].toString().toLowerCase().includes(normalizedFilterStr)
                )
                .filter((v) => v).length > 0
            );
          })
          .map((l) => l.location_id);
      }
    } else {
      // Nothing is selected, there is no filter, and there is no search string
      // In that case we are selecting all locations from the list
      locationIds = filteredData;
    }

    if (gfwList && gfwList === 'Administrative Areas' && locationIds.length > 1) {
      this.setState({
        dialogOpen: true,
        dialogTitle: 'Map View Not Available',
        dialogContent:
          'To view administrative areas on the map, navigate to the Map View tab and click the area you would like to see.',
        isLoading: false,
      });
      return;
    }

    const sendData = {
      l: [proLayers.treeCoverLossID],
      i: selectedLists[0].id,
      name: selectedLists[0].list_name,
      gfwListName: gfwList,
      filterCount,
      listView,
      numLocations: locationIds.length,
      canopyDensity: filters.canopyDensity ? filters.canopyDensity : '',
      filteredLists: locationIds,
      g: gfwList ? discernGfwID(gfwList) : false,
      path: 'lists',
      showFullListMap: allLocationsSelected || showFullListMap,
      totalNumberOfLocationsInList: selectedLists[0].list_locations_count,
    };

    redirectToPage('/map', sendData);
    gtag('event', 'Header button click', {
      event_category: 'Lists Click',
      event_label: 'user is re-directed to the map page via a Lists Header button click',
    });
  };

  // Search selected lists
  myListsSearchFilter = (newValue) => {
    const { selectedLocations, selectedLists } = this.props;
    const { filterString } = this.state;

    this.setState({
      filterStringInputValue: newValue,
    });

    const isGfwList = !isUserList(selectedLists[0]);
    if (isGfwList) {
      //  gfw lists search works in the front end, so it searches as the use types
      this.setState({
        filterString: newValue,
      });

      this.getSearchedLocations(newValue, selectedLocations);
    } else if (newValue === '' && filterString !== '') {
      // if there was a filter string set and we cleared the input text

      // user lists are paginated in the backend
      // so the search term is only set when pressing enter (see setSearchString()) or when deleting the string
      this.setState(
        {
          filterString: '',
        },
        () => {
          this.getUserLocationData(selectedLists[0].id);
        }
      );
    }
  };

  setSearchString = (evt) => {
    // if enter key is pressed and it's not a GFW list, filter locations by input text
    const { selectedLists } = this.props;
    const isGfwList = !isUserList(selectedLists[0]);
    if (evt.keyCode === 13 && !isGfwList) {
      this.setState(
        {
          filterString: evt.target.value.trim(),
        },
        () => {
          this.getUserLocationData(selectedLists[0].id);
        }
      );
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
        this.handleRerunDialogState();
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

  // Flag close function
  closeFlagMenu = () => {
    this.setState({
      openFlagMenu: false,
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
      (selectedLists[0].list_name === 'Administrative Areas' ||
        selectedLists[0].list_name === 'Protected Areas')
    ) {
      if (filteredData.length > 0) {
        store.dispatch(updateListData([]));
        store.dispatch(updateFilteredData([]));
        store.dispatch(updateSelectedLocations([]));
      }
      store.dispatch(toggleCanopyModal());
    }
  };

  setRowProps = (state, rowInfo) => {
    // determine row bg colors based on location status
    // currently only failed locations get dark gray bg color
    function returnBgColor(id) {
      switch (id) {
        case 3:
          return '#BDBDBD';
        default:
          return '';
      }
    }

    // determine row fg colors based on location status,
    // draft locations get gray color across all cells
    function returnFgColor(id) {
      switch (id) {
        case 4:
          return '#939392';
        default:
          return '';
      }
    }

    return {
      style: {
        background:
          rowInfo && rowInfo.original && returnBgColor(rowInfo.original.location_status_id),
        color: rowInfo && rowInfo.original && returnFgColor(rowInfo.original.location_status_id),
      },
    };
  };

  setHeaderProps = (state) => {
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
      .then((info) => {
        this.setState({
          currentAdminAreas: info,
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

  getAdministrativeAreasData = ({ filters, id, locationNameForGFW }) => {
    // when coming from the Map, locationNameForGFW is either the locationName or true
    this.setState({ isLoading: true });
    httpRequest
      .fetchJSON('/locations/getAdministrativeAreasData', { filters, id })
      .then((response) => {
        const currentAdminAreas = JSON.parse(response);
        this.processListData(currentAdminAreas, locationNameForGFW);
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        console.warn('error with grabbing admin areas data', err);
      });
  };

  getProtectedAreasData = ({ filters, id, locationNameForGFW }) => {
    this.setState({ isLoading: true });
    httpRequest
      .fetchJSON('/locations/getProtectedAreasData', { filters, id })
      .then((response) => {
        const currentAdminAreas = JSON.parse(response);
        this.processListData(currentAdminAreas, locationNameForGFW);
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        console.warn('error with grabbing protected areas data', err);
      });
  };

  handleRerunDialogState = () => {
    const { rerunDialogState } = this.state;
    this.setState({ rerunDialogState: !rerunDialogState });
  };

  handleDraftSubmit = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    this.setState({ draftSubmitDialogOpen: true });
  };

  // Change the view that is shown - forest change, policy, commodity risk
  changeListView(listView) {
    const { listView: listViewProps, listData, selectedLists } = this.props;
    if (listView !== listViewProps) {
      const columnNames = getAllColumnNames(
        listView,
        listData[0],
        selectedLists,
        this.getCheckboxColumn
      );
      store.dispatch(changeListView(listView));
      this.clearFilters();
      this.setState({
        listColumns: columnNames.list.filter((c) => this.showListColumn(c)),
        combinedColumns: columnNames.combinedColumns,
      });
    }
  }

  changeFolderView(folder) {
    const { history, showShareList } = this.props;
    showShareList(false);
    history.push('/folders');
    store.dispatch(selectFolder(folder));
    store.dispatch(changeView('folders'));
  }

  // Change the view back to the locations landing page
  /*
  changeToLocationView() {
    const { history } = this.props;
    store.dispatch(changeView('landing'));
    history.push('/');
  }
  */

  listDiagnosticAccess(list) {
    const { selectedLocations, listData } = this.props;

    const areAllSelectedValid =
      selectedLocations.findIndex((locationId) => {
        const data = listData.find((d) => {
          return d.location_id === locationId;
        });
        return data && data.location_status_id !== 2;
      }) === -1;

    const singleLocationCheck = areAllSelectedValid && selectedLocations.length === 1;
    if (!getIsDiagnosticStatusDraft(list)) {
      // List that is not in Draft
      return (
        list && (singleLocationCheck || selectedLocations.length === list.list_locations_count)
      );
    }
    // If one location is selected in draft mode and the location is valid (analyzed) we enable the button
    return singleLocationCheck;
  }

  loadLocationView() {
    // If user_id is a property then this is a user list
    const { selectedLists } = this.props;
    if (selectedLists.length > 0) {
      if (selectedLists[0].list_name === 'Administrative Areas') {
        this.getAdministrativeAreasInfo();
      } else if (Object.hasOwnProperty.call(selectedLists[0], 'user_id')) {
        this.getUserLocationData(selectedLists[0].id);
      } else if (selectedLists[0].list_name === 'Protected Areas') {
        this.getProtectedAreasInfo();
      } else {
        this.getGFWLocationData(selectedLists[0].id);
      }
    } else {
      console.warn('attempting to load location view without a selected list');
    }
  }

  render() {
    const {
      activeTemplate,
      addType,
      anchorEl,
      bubbleData,
      canopyModalVisible,
      commodityType,
      currentUser,
      displayPopover,
      filterCount,
      filteredLocationData,
      filters,
      folders,
      gfwLists: gfwListsProps,
      history,
      listData,
      listView,
      locationCount,
      selectedLists,
      selectedLocations,
      shareView,
      showShareList,
      templateData,
      userLists: userListsProps,
      userSharedLists,
      usersList,
      view,
    } = this.props;

    const {
      anchorElCountries,
      anchorElFlag,
      bannerContent,
      combinedColumns,
      currentAdminAreas,
      currentFolder,
      dialogActions,
      dialogChildren,
      dialogContent,
      dialogOpen,
      dialogTitle,
      draftSubmitDialogOpen,
      filterValues,
      isLoading,
      isManageListFolderOpen,
      isNewListNameDuplicate,
      listColumns,
      filterStringInputValue,
      filterString,
      listNotAccessible,
      myListsSearchFilterSidebarString,
      openCountriesPopover,
      openFlagMenu,
      pAreas,
      refreshPage,
      rerunDialogState,
      selectedMoveOrCopy,
      selectedNewOrExisting,
      userListFilterText,
      newListName,
      showSubmitModal,
      numberOfPages,
      maximumAnalysisAreaInTheList,
      page,
      tableSortedBy,
      tableSortedDesc,
      numberOfResults,
      displayLargeListEditingModal,
      visibleColumns,
      allLocationsSelected,
    } = this.state;

    const userLists = userListsProps
      .filter((list) => list.list_locations_count)
      .filter((list) =>
        myListsSearchFilterSidebarString.length > 0
          ? list.list_name.toLowerCase().includes(myListsSearchFilterSidebarString.toLowerCase())
          : true
      )
      .map((list) => {
        list.globalForestWatchList = false;
        return list;
      })
      .map(this.createUserLists);

    const gfwLists = gfwListsProps
      .map((list) => {
        list.globalForestWatchList = true;
        return list;
      })
      .map(this.createGFWLists);

    const sharedLists = userSharedLists
      .map((list) => {
        list.globalForestWatchList = false;
        return list;
      })
      .map(this.createUserLists);

    const selectedList = selectedLists.length > 0 ? selectedLists[0] : null;
    const locationDataIsNotAvailable = isLocationDataNotAvailable(selectedList);

    const listID = selectedList?.id;
    const countries = [...new Set(filteredLocationData.map((list) => list.Country))].sort();
    const customAttributeNames =
      selectedList &&
      selectedList.custom_attribute_names &&
      selectedList.custom_attribute_names.length > 0
        ? selectedList.custom_attribute_names.split(',')
        : [];
    const flagOptions = columns.flags.map(this.createFlagList);
    const listName = selectedList ? selectedList.list_name : '';
    const listAnalysesStatus = selectedList ? selectedList.listAnalysesStatus : [];
    const isGfwList = gfwListNames.includes(listName);
    // user lists are paginated in the backend, gfw lists search works in the front end
    const filteredLists = isGfwList
      ? getListFilteredLocations(filteredLocationData, combinedColumns, filterString)
      : filteredLocationData;

    const listViewOptions = [];

    const isInFolder = selectedList && !!currentFolder;
    if (selectedList && currentFolder) {
      selectedList.folder = currentFolder;
    }

    const userIsOwner = currentUser.id === selectedList.user_id;
    const validLists = userListsProps.filter((t) => {
      return (
        filterValidTemplates(t, activeTemplate, addType, commodityType) &&
        filterValidCustom(t, customAttributeNames)
      );
    });

    const selectedListIsShared =
      selectedList &&
      userSharedLists &&
      userSharedLists.map((userSharedList) => userSharedList.id).includes(selectedList.id);

    // Viewers cannot move or copy any list
    const canMove =
      selectedList &&
      selectedLocations.length > 0 &&
      currentUser.access_level_id !== userAccessLevel.VIEWER;

    // Admins can delete locations from any list.
    // Viewers cannot delete any locations.
    // Other roles (Editor) can only delete locations from lists they own, not shared lists.
    const canDelete =
      !isGfwList &&
      selectedList &&
      selectedLocations.length > 0 &&
      currentUser.access_level_id !== userAccessLevel.VIEWER &&
      (currentUser.access_level_id === userAccessLevel.ADMIN || !selectedListIsShared);

    if (checkValidView(listData)) {
      listViewOptions.push({ value: 'forest_change', label: locationsPage.lists.viewForestChange });
    }

    if (checkValidViewCommodity(selectedLists, listData)) {
      listViewOptions.push({
        value: 'commodity_risk',
        label: locationsPage.lists.viewCommodityRisk,
      });
    }

    const toggleableColumns = listColumns.map((column) => column.accessor);

    const tableColumns = combinedColumns.slice();
    tableColumns.forEach((col) => {
      if (col.accessor !== 'checkbox') {
        if (toggleableColumns.includes(col.accessor)) {
          if (visibleColumns.includes(col.accessor)) {
            col.show = true;
          } else {
            col.show = false;
          }
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
      }
    });

    const rerunListDialog = `Select OK to update your list. Your list will not be available while the update is processing.
    You will receive an email notification when the update is completed.`;

    const [REACT_TABLE__LOCATION_NAME] = cloneDeep(columns.react_table__location_name);

    let reactTableOptions = {
      data: filteredLists,
      columns: tableColumns,
      defaultPageSize: 50,
      getTheadProps: this.setHeaderProps,
      getTrProps: this.setRowProps,
      pageSizeOptions: [50],
      minRows: 0,
      disableMultiSort: true,
      defaultSorted: [
        {
          id: REACT_TABLE__LOCATION_NAME.id,
          desc: false,
        },
      ],
    };
    // settings for displaying a paginated user list
    if (isUserList(selectedLists[0])) {
      reactTableOptions = {
        ...reactTableOptions,
        showPageSizeOptions: false,
        showPagination: true,
        manual: true,
        pages: numberOfPages,
        page,
        loading: isLoading,
        sorted: [
          {
            id: tableSortedBy,
            desc: tableSortedDesc,
          },
        ],
        onPageChange: (pageIndex) => {
          this.getUserLocationData(selectedLists[0].id, pageIndex);
        },
        onSortedChange: (newSorted, _column, _shiftKey) => {
          this.setState(
            {
              tableSortedBy: newSorted[0].id,
              tableSortedDesc: newSorted[0].desc,
            },
            () => {
              this.getUserLocationData(selectedLists[0].id, page);
            }
          );
        },
      };
    }

    const allDialogActions = dialogActions || [
      <Button
        className="all-dialog-actions"
        variant="primary"
        label={locationsPage.lists.ok}
        onClick={() => this.handleDialogClose(refreshPage)}
      />,
    ];

    return (
      <div>
        {featureFlags?.isAfiAvailable && !isGfwList && (
          <ChangeTypeOfAnalysisModal
            listId={listID}
            listName={listName}
            listAnalysesStatus={listAnalysesStatus}
            setIsChangeTypeOfAnalysisModalOpen={(open) =>
              this.setState({ isChangeTypeOfAnalysisModalOpen: open })
            }
            isChangeTypeOfAnalysisModalOpen={this.state.isChangeTypeOfAnalysisModalOpen}
          />
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
        <Popover
          open={displayPopover}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={closePopover}
        >
          <InfoBubbleContent bubbleData={bubbleData} closeBubble={closePopover} />
        </Popover>

        {dialogOpen && (
          <Dialog
            paperClassName="dialog-paper"
            title={dialogTitle}
            actions={allDialogActions}
            modal={false}
            open
            contentStyle={{ padding: '0 24px' }}
            onRequestClose={() => this.handleDialogClose(refreshPage)}
          >
            {dialogChildren ? (
              <CopyMoveModal
                isGfwList={isGfwList}
                newListName={newListName}
                isNewListNameDuplicate={isNewListNameDuplicate}
                selectedLists={selectedLists}
                locationsCount={allLocationsSelected ? numberOfResults : selectedLocations.length}
                selectedMoveOrCopy={selectedMoveOrCopy}
                selectedNewOrExisting={selectedNewOrExisting}
                setMoveOrCopy={this.setMoveOrCopy}
                setNewOrExisting={this.setNewOrExisting}
                updateNewListName={this.updateNewListName}
                updateSelectedMove={this.updateSelectedMove}
                validLists={validLists}
              />
            ) : (
              <div
                className="dialog-content-email"
                dangerouslySetInnerHTML={{ __html: dialogContent }}
              />
            )}
          </Dialog>
        )}

        {showSubmitModal && (
          <CustomDraftDialog
            open
            closeAction={() => this.setState({ showSubmitModal: false })}
            dialogTitle="Confirm Submission"
            dialogMessage="Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete."
            dialogActionConfirm={() => {
              this.moveSelectedLocations();
            }}
          />
        )}

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
            // eslint-disable-next-line no-return-assign
            onOkButtonPress={() => (window.location = '/locations')}
          />
        )}

        <ModalLoader open={isLoading} />
        <section className="locations-body list-detail-page">
          {selectedList && (
            <div className="flex-grid">
              <Breadcrumbs>
                <LinkButton
                  label={locationsPage.lists.locations}
                  onClick={() => (window.location.href = '/locations')}
                />
                {currentFolder && (
                  <LinkButton
                    label={currentFolder.name}
                    onClick={() => this.changeFolderView(currentFolder)}
                  />
                )}
                {shareView ? (
                  <LinkButton label={listName} onClick={() => showShareList(false)} />
                ) : (
                  <span>{listName}</span>
                )}
                {shareView && <span>{locationsPage.lists.share}</span>}
              </Breadcrumbs>

              <div style={{ marginLeft: 'auto', display: 'flex' }}>
                <AnalysisListChips listAnalysesStatus={listAnalysesStatus} />
                {featureFlags?.isAfiAvailable && !isGfwList && (
                  <Button
                    icon={<SettingsIcon fontSize="17px" />}
                    style={{ height: '17px', width: '40px', minWidth: '0px' }}
                    onClick={() => {
                      this.setState({ isChangeTypeOfAnalysisModalOpen: true });
                    }}
                  />
                )}
              </div>
            </div>
          )}
          <div className="flex-grid">
            <aside className="col list-side-panel">
              {!shareView && <SharingList history={history} locationCount={locationCount} />}

              {!shareView && (
                <div className="gfw-lists-summary">
                  <h3 className="gfw-lists-summary__title">{locationsPage.lists.gfwLists}</h3>
                  {gfwLists}
                </div>
              )}

              {currentUser.access_level_id !== userAccessLevel.ADMIN && !shareView && (
                <div className="shared-lists-summary">
                  <div className="shared-lists-summary__title">
                    {locationsPage.lists.sharedLists}
                  </div>
                  {sharedLists}
                </div>
              )}

              <div
                className={`my-lists-summary ${
                  currentUser.access_level_id === userAccessLevel.VIEWER ? 'hidden' : ''
                }`}
              >
                <h3 className="my-lists-summary__title">{locationsPage.lists.myLists}</h3>
                <ListsFilter
                  value={myListsSearchFilterSidebarString}
                  onChange={(value) => {
                    if (value !== '' && userListFilterText === '') {
                      gtag('event', 'User enters search', {
                        event_category: 'Lists Click',
                      });
                    }
                    if (value === '' && userListFilterText !== '') {
                      gtag('event', 'User clears search', {
                        event_category: 'Lists Click',
                      });
                    }
                    this.setState({ myListsSearchFilterSidebarString: value });
                  }}
                />
                <div className="my-lists-summary__lists">
                  {userLists.length ? (
                    userLists
                  ) : (
                    <div className="my-lists-summary__no-results">
                      <p className="my-lists-summary__no-results-prompt">
                        {locationsPage.lists.listsFilterNoMatch}
                      </p>
                      <LinkButton
                        className="my-lists-summary__no-results-clear"
                        label={locationsPage.lists.listsFilterClear}
                        onClick={() => this.setState({ myListsSearchFilterSidebarString: '' })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </aside>
            <section className="main-panel">
              {/* Shared lists view */}
              {shareView ? (
                <>
                  <div className="list-detail-header">
                    <ListTitle
                      anchorElCountries={anchorElCountries}
                      closeCountriesPopover={this.closeCountriesPopover}
                      countries={countries}
                      currentUser={currentUser}
                      filteredLists={filteredLists}
                      filterValues={filterValues}
                      listLocationsCount={numberOfResults}
                      listName={listName}
                      openCountriesPopover={openCountriesPopover}
                      selectedList={selectedList}
                      shareView={shareView}
                      showShareList={showShareList}
                      toggleCountriesPopover={this.toggleCountriesPopover}
                    />
                  </div>
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
                  <div className="list-detail-header">
                    <ListTitle
                      anchorElCountries={anchorElCountries}
                      closeCountriesPopover={this.closeCountriesPopover}
                      countries={countries}
                      currentUser={currentUser}
                      filteredLists={filteredLists}
                      filterValues={filterValues}
                      listLocationsCount={numberOfResults}
                      listName={listName}
                      openCountriesPopover={openCountriesPopover}
                      selectedList={selectedList}
                      shareView={shareView}
                      showShareList={showShareList}
                      toggleCountriesPopover={this.toggleCountriesPopover}
                    />
                    <div className="list-actions-container">
                      {selectedList && !selectedList.globalForestWatchList && (
                        <div>
                          <Button
                            label={
                              isInFolder
                                ? locationsPage.lists.manage
                                : locationsPage.lists.addToFolder
                            }
                            onClick={() => {
                              this.setState({ isManageListFolderOpen: true });
                            }}
                          />
                          <ManageListFolderDialog
                            isOpen={isManageListFolderOpen}
                            folders={folders}
                            list={selectedList}
                            onCancel={() => this.setState({ isManageListFolderOpen: false })}
                            onComplete={(msg) => {
                              getFolders().then((foldersLocal) => {
                                store.dispatch(updateFolders(foldersLocal));
                                const currentFolderLocal =
                                  folders && folders.length > 0
                                    ? folders.find((folder) =>
                                        folder.lists && folder.lists.length > 0
                                          ? folder.lists.find(
                                              (listId) => listId === selectedList.id
                                            )
                                          : null
                                      )
                                    : null;
                                this.setState({
                                  bannerContent: msg,
                                  isManageListFolderOpen: false,
                                  currentFolder: currentFolderLocal,
                                });
                              });
                            }}
                          />
                        </div>
                      )}
                      {(currentUser.access_level_id === userAccessLevel.ADMIN ||
                        (selectedList &&
                          currentUser.id === selectedList.user_id &&
                          currentUser.access_level_id !== userAccessLevel.VIEWER)) &&
                      selectedList &&
                      selectedList.list_status_id !== 1 &&
                      !getIsDiagnosticStatusDraft(selectedList) &&
                      !selectedList.globalForestWatchList ? (
                        <div id="RerunList" className="selected-rerun-list">
                          <Button
                            className="RerunList__button"
                            onClick={this.handleRerunDialogState}
                            icon={<IconRerun height="14px" />}
                            label="Update"
                          />
                          <Dialog
                            title={locationsPage.lists.confirmListUpdate}
                            actions={
                              <div className="RerunList__dialog-buttons">
                                <Button
                                  variant="primary"
                                  className="RerunList__button"
                                  label="OK"
                                  onClick={this.rerunList}
                                />
                                <LinkButton
                                  className="RerunList__button"
                                  label="Cancel"
                                  onClick={this.handleRerunDialogState}
                                />
                              </div>
                            }
                            modal={false}
                            open={rerunDialogState}
                            onRequestClose={this.handleRerunDialogState}
                            bodyClassName="dialog__body"
                            contentClassName="dialog__content"
                          >
                            {rerunListDialog}
                          </Dialog>
                        </div>
                      ) : null}

                      {currentUser.access_level_id === userAccessLevel.ADMIN &&
                      selectedList &&
                      selectedList.list_status_id !== 1 &&
                      !selectedList.globalForestWatchList ? (
                        <div id="ShareList">
                          <Button
                            className="ShareList__button"
                            onClick={() => {
                              showShareList(true);
                            }}
                            icon={<IconShare height="14px" />}
                            label="Share"
                          />
                        </div>
                      ) : null}
                      {(currentUser.access_level_id === userAccessLevel.ADMIN ||
                        (currentUser.access_level_id !== userAccessLevel.ADMIN && userIsOwner)) &&
                      selectedList &&
                      selectedList.list_status_id !== 1 &&
                      getIsDiagnosticStatusDraft(selectedList) &&
                      !selectedList.globalForestWatchList ? (
                        <div id="ShareList">
                          <Button
                            variant="primary"
                            className="ShareList__button"
                            onClick={(e) => this.handleDraftSubmit(e)}
                            label="Submit"
                          />
                        </div>
                      ) : null}

                      <CustomDraftDialog
                        open={draftSubmitDialogOpen}
                        closeAction={() => {
                          this.setState({ draftSubmitDialogOpen: false });
                        }}
                        dialogTitle={locationsPage.lists.confirmListSubmission}
                        dialogMessage="Click OK to submit this list for analysis. You will not be able to access the list until analysis is complete."
                        dialogActionConfirm={() => {
                          requestGeoTrellisAnalyzeList(selectedList)
                            .then(() => {
                              gtag('event', 'Submit List', {
                                event_category: 'Submit',
                                event_label: 'User submits a list for analysis',
                              });
                              gtag('event', 'Submit List', {
                                event_category: 'Submit',
                                event_label: 'User submits a list from listview page',
                              });
                              // TODO: Get details what to do after list is submitted
                              window.location.reload();
                            })
                            .catch((error) => {
                              // TODO: Get details what to do after list submission fails
                              console.log(error);
                            })
                            .finally(() => {
                              this.setState({ draftSubmitDialogOpen: false });
                            });
                        }}
                      />
                    </div>
                  </div>
                  {!locationDataIsNotAvailable && (
                    <>
                      <div className="list-detail-filters">
                        <div className="list-detail-filters__view">
                          {listViewOptions.length > 1 && (
                            // only display Commodity Risk / Forest Change view toggle in Commodity Risk lists
                            <>
                              <label htmlFor="viewToggle">
                                {locationsPage.lists.viewToggleLabel}
                              </label>
                              <GfwSelect
                                id="viewToggle"
                                name="viewToggle"
                                onChange={(e) => this.changeListView(e.value)}
                                value={{ value: listView }}
                                options={listViewOptions}
                              />
                            </>
                          )}
                        </div>

                        <div className="list-detail-filters__content-filters">
                          {!shareView && (
                            <ListsFilter
                              placeholder={
                                isGfwList ? '' : locationsPage.lists.searchStringInputPlaceholder
                              }
                              value={filterStringInputValue}
                              onChange={this.myListsSearchFilter}
                              onkeydown={this.setSearchString}
                            />
                          )}
                          {filterCount === 0 ? (
                            <Button
                              disabled={!selectedList}
                              onClick={this.toggleCanopyModal}
                              label={transifex(locationsPage.lists.selectFilters)}
                            />
                          ) : (
                            <div className="compound-button">
                              <Button
                                variant="primary"
                                className="compound-button__action-button"
                                disabled={!selectedList}
                                onClick={this.toggleCanopyModal}
                                label={`${filterCount} ${
                                  filterCount === 1
                                    ? transifex(locationsPage.lists.filter)
                                    : transifex(locationsPage.lists.filters)
                                }`}
                                title={
                                  filterCount > 0
                                    ? // Display a comma-separated list of active filter values.
                                      Object.entries(filters)
                                        .filter(this.isFilterValueDifferentThanDefault)
                                        // eslint-disable-next-line array-callback-return
                                        .map(([key, val]) => {
                                          if (val !== undefined && val !== null && val !== '') {
                                            const strValue = String(val)
                                              .split(',')
                                              .map((x) =>
                                                transifex(x.charAt(0).toUpperCase() + x.slice(1))
                                              )
                                              .join(',');
                                            return `${transifex(
                                              locationsPage.lists[key]
                                            )}: ${strValue}`;
                                          }
                                        })
                                        .join(' - ')
                                    : ''
                                }
                              />
                              <IconButton
                                variant="primary"
                                className="compound-button__clear"
                                onClick={this.clearFilters}
                                icon={<IconTimes height="15" />}
                                size="large"
                                title={locationsPage.lists.clearFilters}
                              />
                            </div>
                          )}
                          <LocationsTableColumnSelector
                            listColumns={listColumns}
                            setListColumns={(newVisibleColumns) =>
                              this.setState({
                                visibleColumns: newVisibleColumns,
                              })
                            }
                            disabled={!selectedList}
                          />
                        </div>
                      </div>
                      <div className="list-detail-action-bar">
                        {!getIsDiagnosticStatusDraft(selectedList) &&
                          listName !== 'Administrative Areas' &&
                          listName !== 'Protected Areas' &&
                          (isGfwList || getActiveAnalysisType(listAnalysesStatus)) && (
                            <Button
                              variant="primary"
                              data-cy="list-diagnostics"
                              className="list-detail-action-bar__diagnostic-button"
                              onClick={() => this.viewDiagnostic(false)}
                              label="List diagnostic"
                              icon={<IconListAlt />}
                            />
                          )}
                        <Button
                          className="list-detail-action-bar__map-button"
                          onClick={() => this.viewMap({ showFullListMap: true })}
                          label="Full List Map"
                          icon={<IconGlobeAmericas />}
                        />
                      </div>
                      <div className="list-detail-action-bar">
                        {selectedLocations.length === 1 &&
                          (isGfwList || getActiveAnalysisType(listAnalysesStatus)) && (
                            <Button
                              variant="primary"
                              className="list-detail-action-bar__diagnostic-button"
                              disabled={!this.listDiagnosticAccess(selectedList)}
                              onClick={() => this.viewDiagnostic(true)}
                              label="Location diagnostic"
                              icon={<IconListAlt />}
                            />
                          )}
                        {selectedList && selectedLocations.length > 0 && (
                          <Button
                            className="list-detail-action-bar__map-button"
                            onClick={() => this.viewMap({ showFullListMap: false })}
                            label="Location(s) Map"
                            icon={<IconGlobeAmericas />}
                          />
                        )}
                        {selectedList &&
                          selectedLocations.length > 0 &&
                          !isGfwList &&
                          !selectedListIsShared && (
                            <EditList
                              editList={this.editList}
                              currentUser={currentUser}
                              selectedLocations={selectedLocations}
                            />
                          )}
                        {canMove && (
                          <Button
                            variant="tertiary"
                            onClick={this.promptMoveSelectedLocations}
                            label={locationsPage.lists.move}
                          />
                        )}
                        {selectedList && selectedLocations.length > 0 && listData.length > 0 && (
                          <ListDownload
                            listID={listID}
                            listName={listName}
                            filters={filters}
                            listFilterStr={filterString}
                            tableSortedBy={tableSortedBy}
                            tableSortedDesc={tableSortedDesc}
                            selectedList={selectedList}
                            combinedColumns={visibleColumns}
                            selectedLocations={selectedLocations}
                            currentUser={currentUser}
                            allLocationsSelected={allLocationsSelected}
                            listView={listView}
                            isLoading={(loading) => {
                              this.setState({ isLoading: loading });
                            }}
                          />
                        )}
                        {canDelete && (
                          <Button
                            className="list-detail-action-bar__delete-button"
                            variant="danger"
                            onClick={this.promptDeleteSelectedLocations}
                            label={locationsPage.lists.delete}
                          />
                        )}
                      </div>
                      <section className="section-container table-container">
                        {filteredLists.length > 0 &&
                        listView !== '' &&
                        filteredLocationData.length > 0 ? (
                          <ReactTable
                            className={`-striped -highlight notranslate lists-react-table table__${listView}`}
                            {...reactTableOptions}
                          />
                        ) : null}
                      </section>
                    </>
                  )}
                </>
              )}
              <LocationDataNotAvailableMessage list={selectedList} />
            </section>
          </div>
        </section>
        <Popover
          open={openFlagMenu}
          anchorEl={anchorElFlag}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.closeFlagMenu}
        >
          <Menu>
            <div>
              {flagOptions}
              <Button variant="primary" onClick={this.updateFlag} label="Save" />
            </div>
          </Menu>
        </Popover>
        <div
          className={`layer-modal-container modal-wrapper ${canopyModalVisible ? '' : 'hidden'}`}
        >
          {(() => {
            if (listView === 'commodity_risk') {
              return (
                <CommodityRiskFilterDrawer
                  listName={listName}
                  listData={listData}
                  filterCount={filterCount}
                  listView={listView}
                  clearFilters={this.clearFilters}
                />
              );
            }
            if (listView === 'forest_change') {
              return (
                <ForestChangeFilterDrawer
                  listName={listName}
                  listData={listData}
                  filterCount={filterCount}
                  listView={listView}
                  adminAreas={currentAdminAreas}
                  history={history}
                  protectedAreas={pAreas}
                  filterValues={filterValues}
                  maximumAnalysisAreaInTheList={maximumAnalysisAreaInTheList}
                  clearFilters={this.clearFilters}
                />
              );
            }
            return null;
          })()}
        </div>
        {displayLargeListEditingModal && (
          <LargeListEditing
            addType={addType}
            activeTemplate={activeTemplate}
            commodityType={commodityType}
            templateData={templateData}
            customAttributeNames={customAttributeNames}
            listID={listID}
            listName={listName}
            filters={filters}
            tableSortedBy={tableSortedBy}
            tableSortedDesc={tableSortedDesc}
            selectedLocations={selectedLocations}
            onClose={(refreshTable) => {
              this.setState({ displayLargeListEditingModal: false });
              if (refreshTable) {
                this.getUserLocationData(listID);
              }
            }}
            isLoading={(loading) => {
              this.setState({ isLoading: loading });
            }}
          />
        )}
      </div>
    );
  }
}
