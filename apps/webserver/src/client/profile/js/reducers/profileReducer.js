// updateCriteria
import {
  ADD_USER,
  CURRENT_USER,
  CURRENT_ACCOUNT,
  SAVE_USERS,
  UPDATE_USER,
  UPDATED_USERS,
  UPDATE_CURRENT_USER,
} from '../constants/actionTypes';

const initialProfileState = {
  currentUser: {},
  currentAccount: {},
};

export function changeUser(state = initialProfileState.currentUser, action) {
  switch (action.type) {
    case CURRENT_USER:
      return action.data;
    case UPDATE_CURRENT_USER:
      return Object.assign(state, action.user);
    default:
      return state;
  }
}

export function changeAccount(state = initialProfileState.currentAccount, action) {
  return action.type !== CURRENT_ACCOUNT ? state : action.data;
}

export function saveUsers(state = [], action) {
  switch (action.type) {
    case SAVE_USERS:
      return action.users;
    case ADD_USER:
      state.push(action.user);
      return state;
    case UPDATE_USER: {
      // Find user to be updated
      const user = state.filter((usr) => usr.user_id === action.user.user_id)[0];
      // Get the index of the user
      const index = state.indexOf(user);
      console.log('user', user);
      console.log('index', index);
      if (index > -1) {
        state[index] = Object.assign(user, action.user);
      }
      return state;
    }
    default:
      return state;
  }
}
