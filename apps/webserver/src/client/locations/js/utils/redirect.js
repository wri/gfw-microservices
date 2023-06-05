import store from '../store';
import {
  addList,
  changeView,
  resetList,
  toggleCanopyModal,
  updateFilteredData,
  updateListData,
  updateSelectedLocations,
  selectList,
} from '../actions/locationActions';

const onListFromViewToList = (list, canopyModalVisible, history) => {
  history.push('/lists');

  if (list.list_name === 'Administrative Areas' || list.list_name === 'Protected Areas') {
    if (!canopyModalVisible) {
      // Open filter modal on viewing either of these two lists
      store.dispatch(toggleCanopyModal());
    } else {
      // If the modal was already open, close it first, then re-open
      store.dispatch(toggleCanopyModal());
      store.dispatch(toggleCanopyModal());
    }
  }

  store.dispatch(selectList(list));
  store.dispatch(resetList());
  store.dispatch(updateListData([]));
  store.dispatch(updateFilteredData([]));
  store.dispatch(updateSelectedLocations([]));

  if (
    list.list_name !== 'All Locations' &&
    list.list_name !== 'Investments' &&
    list.list_name !== 'Commodities'
  ) {
    store.dispatch(addList(list));
  }
  store.dispatch(changeView('lists'));
};

export default onListFromViewToList;
