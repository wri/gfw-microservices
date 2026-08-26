import { VIEW_READY, SHARED_COLOR } from '../constants/action-types.constants';

export function viewCreated() {
  return { type: VIEW_READY };
}

export function sharedColor() {
  return { type: SHARED_COLOR };
}
