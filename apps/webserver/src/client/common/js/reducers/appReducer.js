// @flow
import { combineReducers } from 'redux';
import { viewCreated } from './commonReducer';

const appReducer = combineReducers({
  viewReady: viewCreated,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined; //passes in initialState by default!
  }
  return appReducer(state, action);
};

export default rootReducer;
