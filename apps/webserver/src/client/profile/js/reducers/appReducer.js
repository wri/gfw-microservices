import { changeUser, changeAccount, saveUsers } from './profileReducer';
import { combineReducers } from 'redux';

const appReducer = combineReducers({
  currentUser: changeUser,
  currentAccount: changeAccount,
  organizationUsers: saveUsers,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined; //passes in initialState by default!
  }

  return appReducer(state, action);
};

export default rootReducer;
