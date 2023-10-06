import React, { useState } from 'react';
import { locationsPage, userAccessLevel } from '../../config';
import { numberWithCommas } from '../../../../locations/js/utils/locationsTableUtils';
import store from '../../../../dashboard/js/store';
import { updateLocationFilter } from '../../../../dashboard/js/actions/dashboardActions';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import FailedTooltip from '../CustomTooltip/FailedTooltip';
import InlineLoader from '../Loaders/InlineLoader';
import { getIsDiagnosticStatusDraft } from '../../../../locations/js/utils/draft.utils';
import { listStatus } from '../../../../../config/env/listStatuses.constants';
import { analysisTypes } from 'apps/webserver/src/config/env/analysisTypes.constants';

function selectTooltipMessage(currentUser, list, listDraftStatus, listContext) {
  const userIsOwner = currentUser.id === list.user_id;
  const userIsAdmin = currentUser.access_level_id === userAccessLevel.ADMIN;
  const showNonOwnerDraft = !userIsAdmin && !userIsOwner && listDraftStatus;

  const TOOLTIP__MESSAGE_MAP =
    'This list is in draft form. All locations in draft lists can be viewed on the map. To receive analysis for the list, please navigate to the Locations page and click Submit.';
  const TOOLTIP__MESSAGE_MAP_NON_OWNER =
    'This list is in draft form. All locations in draft lists can be viewed on the map. To recieve analysis for the list, the list owner will need to submit the list for analysis.';
  const TOOLTIP__MESSAGE_DASHBOARD =
    'This list is in draft form. Draft lists cannot be viewed on the Dashboard. To view alerts for this list on the dashboard, please navigate to the Locations page and click Submit.';
  const TOOLTIP__MESSAGE_DASHBOARD_NON_OWNER =
    'This list is in draft form. Draft lists cannot be viewed on the Dashboard. The list owner will need to submit the list for analysis. Once submitted, this list will not be accessible until analysis is complete.';
  if (listContext === 'map') {
    // we are in map
    return showNonOwnerDraft ? TOOLTIP__MESSAGE_MAP_NON_OWNER : TOOLTIP__MESSAGE_MAP;
  }
  // we are in dashboard
  return showNonOwnerDraft ? TOOLTIP__MESSAGE_DASHBOARD_NON_OWNER : TOOLTIP__MESSAGE_DASHBOARD;
}

function ListPanel({
  locationCount,
  userLists,
  gfwLists,
  userSharedLists,
  selectedListCallback,
  listContext,
  selectedList,
  currentUser,
}) {
  const [showListPanel, setShowListPanel] = useState(false);

  const handleSelectedList = (listObj) => {
    const { locationFilters } = store.getState();
    let locationFiltersToggledOn = false;
    Object.keys(locationFilters).forEach((key) => {
      if (locationFilters[key] === true) {
        locationFiltersToggledOn = true;
      }
    });

    if (locationFiltersToggledOn) {
      const filterObject = {
        ALERTS: false,
        FLAGGED: false,
        NOALERTS: false,
      };
      store.dispatch(updateLocationFilter(filterObject));
    }

    const joinAllLists = [...userLists, ...gfwLists, ...userSharedLists];

    const currentlySelectedList = joinAllLists.filter(
      (l) => l.list_name === listObj.list_name && l.id === listObj.id
    )[0];
    selectedListCallback(currentlySelectedList);
  };

  const togglePanel = () => {
    setShowListPanel(!showListPanel);
  };

  const createListsRenderer = (list, index) => {
    const listDraftStatus = getIsDiagnosticStatusDraft(list);
    const tooltipMessage = selectTooltipMessage(currentUser, list, listDraftStatus, listContext);
    const IS_LOCK_STATUS = !!(list.lock_status && list.lock_user_id);

    const hasAlertsAnalysisActive = list?.listAnalysesStatus?.some(
      ({ status, analysisId }) =>
        status === listStatus.Active && analysisId === analysisTypes.ALERTS
    );

    let className = '';
    if (list.list_status_id === listStatus.Pending || IS_LOCK_STATUS) {
      // Pending
      className = 'locations-list-name__inactive';
    } else if (list.list_status_id === listStatus.Inactive) {
      // Inactive
      className = 'locations-list-name__failed';
    } else if (listDraftStatus && listContext === 'map') {
      // Draft in Map
      className = 'locations-list-name__map_draft';
    } else if ((!hasAlertsAnalysisActive || listDraftStatus) && listContext === 'dashboard') {
      // Draft in Dashboard
      className = 'locations-list-name__dash_draft';
    }
    const onClickHandler = () => {
      togglePanel();
      if (
        (hasAlertsAnalysisActive && listContext === 'dashboard') ||
        (list.list_status_id === listStatus.Active && listContext === 'map') ||
        (getIsDiagnosticStatusDraft(list) && listContext === 'map')
      ) {
        handleSelectedList(list);
      }
    };

    return (
      <div
        className={`locations-list-name ${className} ${
          selectedList && selectedList.id === list.id && selectedList.list_name === list.list_name
            ? 'locations-selected-list'
            : ''
        }`}
        onClick={IS_LOCK_STATUS ? undefined : onClickHandler}
        aria-hidden="true"
        id={list.list_name}
        key={index}
      >
        <div className="locations-list-label">
          <span style={{ wordBreak: 'break-word' }}>{list.list_name}</span>
        </div>
        <div style={{ display: 'flex', justifyItems: 'right' }}>
          {getIsDiagnosticStatusDraft(list) && (
            <CustomTooltip
              placement="top"
              tooltipMessage={tooltipMessage}
              iconWidth={14}
              iconHeight={14}
            />
          )}
          {list.list_status_id === listStatus.Inactive && (
            <span className="my-lists-summary__icon-container" style={{ color: '#EB0026' }}>
              <FailedTooltip
                placement="top"
                label=""
                tooltipMessage="This list has failed analysis. To receive results, resubmit this list for analysis."
              />
            </span>
          )}
          {(list.list_status_id === listStatus.Pending || IS_LOCK_STATUS) && (
            <span className="my-lists-summary__icon-container">
              <InlineLoader />
            </span>
          )}
          <div className="locations-list-count">{numberWithCommas(list.list_locations_count)}</div>
        </div>
      </div>
    );
  };

  const userListsRendered =
    userLists.length > 0
      ? userLists.filter((list) => list.list_locations_count).map(createListsRenderer)
      : null;

  const gfwListsRendered =
    gfwLists.length > 0
      ? gfwLists
          .filter((list) => list.list_name !== 'Administrative Areas')
          .map(createListsRenderer)
      : null;

  const userSharedListsRendered =
    userSharedLists.length > 0 ? userSharedLists.map(createListsRenderer) : null;

  return (
    <div className={`button-list-panel-container ${showListPanel ? 'panel-open' : ''}`}>
      <button
        type="button"
        onClick={togglePanel}
        className="gfw-button list-section-button show-lists"
      >
        Show Lists
      </button>

      <div className="list-menu-container">
        <div className="locations-list-group lists-list-group">
          <div className="locations-list-header">{locationsPage.lists.savedLocations}</div>
          <div className="sidebar-divider" />
          <div className="locations-list-body">
            <div className="locations-list-name saved-location">
              {locationsPage.lists.allLocations}
              <span className="locations-list-count">
                {locationCount.TotalCount ? numberWithCommas(locationCount.TotalCount) : 0}
              </span>
            </div>
            <div className="locations-list-name saved-location">
              {locationsPage.lists.investment}
              <span className="locations-list-count">
                {locationCount.InvestmentCount
                  ? numberWithCommas(locationCount.InvestmentCount)
                  : 0}
              </span>
            </div>
            <div className="locations-list-name saved-location">
              {locationsPage.lists.commodity}
              <span className="locations-list-count">
                {locationCount.CommodityCount ? numberWithCommas(locationCount.CommodityCount) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="locations-list-group lists-list-group list-my-lists">
          <div className="locations-list-header">{locationsPage.lists.myLists}</div>
          <div className="sidebar-divider" />
          <div className="locations-list-body">{userListsRendered}</div>
        </div>

        {gfwListsRendered && (
          <div className="locations-list-group lists-list-group">
            <div className="locations-list-header">{locationsPage.lists.gfwLists}</div>
            <div className="sidebar-divider" />
            <div className="locations-list-body">{gfwListsRendered}</div>
          </div>
        )}

        {userSharedListsRendered && userSharedListsRendered.length > 0 && (
          <div className="locations-list-group lists-list-group">
            <div className="locations-list-header">{locationsPage.lists.sharedLists}</div>
            <div className="sidebar-divider" />
            <div className="locations-list-body">{userSharedListsRendered}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListPanel;
