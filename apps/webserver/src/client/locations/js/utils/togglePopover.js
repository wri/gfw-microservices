import Deferred from 'dojo/Deferred';

// REDUX - Store
import {
  updateInfoBubbleCache,
  toggleInfoPopover,
  updatePopoverLoadingId,
  updateBubbleData,
  updatePopoverAnchorEl,
} from '../actions/locationActions';
import store from '../store';

// Configs
import { DATA_API_URL } from '../../../common/js/config';

export const togglePopover = (evt, infoBubbleCache) => {
  evt.preventDefault();
  const target = evt.currentTarget;
  const infoBubbleId = target.id;

  store.dispatch(updatePopoverLoadingId(infoBubbleId));

  const checkInfoBubbleCache = (id) => {
    return infoBubbleCache.hasOwnProperty(id) && infoBubbleCache[id] !== null;
  };

  if (checkInfoBubbleCache(infoBubbleId)) {
    store.dispatch(toggleInfoPopover(true));
    store.dispatch(updatePopoverLoadingId(''));
    store.dispatch(updateBubbleData(infoBubbleCache[infoBubbleId]));
    store.dispatch(updatePopoverAnchorEl(target));
    // early return if we have the info in cache
    return;
  }

  // if the info is not in the cache, go get it
  const promise = new Deferred();
  const request = new XMLHttpRequest();

  request.addEventListener('load', () => {
    const resp = JSON.parse(request.response);
    store.dispatch(updateInfoBubbleCache(infoBubbleId, resp.data));
    store.dispatch(toggleInfoPopover(true));
    store.dispatch(updatePopoverLoadingId(''));
    store.dispatch(updateBubbleData(resp.data));
    store.dispatch(updatePopoverAnchorEl(target));
  });

  request.onerror = () => {
    promise.resolve(false);
  };

  request.open('POST', `${DATA_API_URL}/dataApi/getInfoBubbleData/${infoBubbleId}`);
  request.send();

  gtag('event', 'info button click', {
    ''event_category'': 'Diagnostics Click',
    ''event_label'': `user clicked on the info button for ${infoBubbleId}`,
  });
};

export const closePopover = () => {
  store.dispatch(toggleInfoPopover(false));
};
