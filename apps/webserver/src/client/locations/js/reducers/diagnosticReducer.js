import * as types from '../constants/actionTypes';

function diagnosticReducer(intermediateState = {}, previousState = {}, action) {
  const { diagnosticView } = previousState;
  switch (action.type) {
    case types.UPDATE_SELECTED_LOCATIONS: {
      const { data } = action;
      const { listData } = intermediateState;
      return data.length === listData.length ? 'LIST' : 'LOCATION';
    }
    default:
      return typeof diagnosticView === 'undefined' ? 'LOCATION' : diagnosticView;
  }
}

module.exports = diagnosticReducer;
