import {
  ADD_USER,
  CURRENT_USER,
  CURRENT_ACCOUNT,
  SAVE_USERS,
  UPDATE_USER,
  UPDATE_CURRENT_USER,
} from '../constants/actionTypes';

export function updateCurrentUser(user) {
  return { type: UPDATE_CURRENT_USER, user };
}

export function changeUser(data) {
  return { type: CURRENT_USER, data };
}

export function changeAccount(data) {
  return { type: CURRENT_ACCOUNT, data };
}

export function saveUsers(users) {
  return { type: SAVE_USERS, users };
}

export function addUser(user) {
  return { type: ADD_USER, user };
}

export function updateUser(user) {
  return { type: UPDATE_USER, user };
}
