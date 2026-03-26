// REDUX - Store
import {
  updateInfoBubbleCache,
  updatePopoverLoadingId,
  showInfoPopover,
  toggleInfoPopover,
} from '../actions/locationActions';
import store from '../store';
import errorLogger from '../../../common/js/utils/errorLogger';

// Configs
import { DATA_API_URL } from '../../../common/js/config';

export const togglePopover = (evt, infoBubbleCache) => {
  evt.preventDefault();
  const target = evt.currentTarget;
  const infoBubbleId = target.id;

  store.dispatch(updatePopoverLoadingId(infoBubbleId));

  const checkInfoBubbleCache = (id) => {
    return infoBubbleCache[id] !== undefined && infoBubbleCache[id] !== null;
  };

  if (checkInfoBubbleCache(infoBubbleId)) {
    store.dispatch(
      showInfoPopover({
        displayPopover: true,
        popoverLoading: '',
        bubbleData: infoBubbleCache[infoBubbleId],
        anchorEl: target,
      })
    );
    // early return if we have the info in cache
    return;
  }

  // if the info is not in the cache, go get it
  const request = new XMLHttpRequest();

  request.addEventListener('load', () => {
    const resp = JSON.parse(request.response);
    store.dispatch(updateInfoBubbleCache(infoBubbleId, resp.data));
    store.dispatch(
      showInfoPopover({
        displayPopover: true,
        popoverLoading: '',
        bubbleData: resp.data,
        anchorEl: target,
      })
    );
  });

  request.onerror = () => {
    errorLogger.error('Error requesting InfoBubble data', {
      component: 'togglePopover',
      action: 'togglePopoverWith',
      infoBubbleId,
    });
  };

  request.open('POST', `${DATA_API_URL}/dataApi/getInfoBubbleData/${infoBubbleId}`);
  request.send();

  gtag('event', 'info button click', {
    event_category: 'Diagnostics Click',
    event_label: `user clicked on the info button for ${infoBubbleId}`,
  });
};

export const closePopover = () => {
  store.dispatch(toggleInfoPopover(false));
};
