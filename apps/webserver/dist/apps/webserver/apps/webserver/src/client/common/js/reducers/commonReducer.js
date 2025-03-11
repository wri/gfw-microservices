//updateCriteria
import { VIEW_READY, SHARED_COLOR } from '../constants/actionTypes';
// import {initialCommonState} from 'js/config';
const initialCommonState = {
  viewReady: false,
  sharedColor: 'green',
};

export function viewCreated(state = initialCommonState.viewReady, action) {
  return action.type !== VIEW_READY ? state : true;
}

export function shareColor(state = initialCommonState.sharedColor, action) {
  return action.type !== SHARED_COLOR ? state : true;
}
