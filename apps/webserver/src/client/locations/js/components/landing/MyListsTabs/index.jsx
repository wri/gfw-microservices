import React from 'react';
import { MY_LISTS, MY_SHARED_LISTS, LISTS_SHARED_WITH_ME } from './MyListsTabs.constants';
import { locationsPage } from '../../../../../common/js/config';
import './MyListsTabs.scss';

function MyListsTabs({ selectedTab, onListsTabSelected, showMySharedLists, showListsSharedWithMe }) {
  const onlyShowMyListsOption = !showMySharedLists && !showListsSharedWithMe;
  const isMyListsOptionsSelected = (selectedTab === MY_LISTS || selectedTab === '') && !onlyShowMyListsOption;

  return (
    <div className="my-lists-tabs">
      <button
        className={`my-lists-tabs__tab ${isMyListsOptionsSelected ? 'my-lists-tabs__tab--selected' : ''} `}
        type="button"
        onClick={() => onListsTabSelected(MY_LISTS)}
      >
        <h5>{locationsPage.landing.myLists}</h5>
      </button>
      {showMySharedLists && (
        <button
          className={`my-lists-tabs__tab ${selectedTab === MY_SHARED_LISTS ? 'my-lists-tabs__tab--selected' : ''} `}
          type="button"
          onClick={() => onListsTabSelected(MY_SHARED_LISTS)}
        >
          <h5>{locationsPage.landing.mySharedLists}</h5>
        </button>
      )}
      {showListsSharedWithMe && (
        <button
          className={`my-lists-tabs__tab ${
            selectedTab === LISTS_SHARED_WITH_ME ? 'my-lists-tabs__tab--selected' : ''
          } `}
          type="button"
          onClick={() => onListsTabSelected(LISTS_SHARED_WITH_ME)}
        >
          <h5>{locationsPage.landing.listsSharedWithMe}</h5>
        </button>
      )}
    </div>
  );
}

export default MyListsTabs;
