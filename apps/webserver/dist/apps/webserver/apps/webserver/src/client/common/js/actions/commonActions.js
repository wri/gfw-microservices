import { VIEW_READY, SHARED_COLOR } from '../constants/actionTypes';

export function viewCreated() {
  return { type: VIEW_READY };
}

export function sharedColor() {
  return { type: SHARED_COLOR };
}
