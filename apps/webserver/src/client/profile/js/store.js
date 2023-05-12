import { createStore, applyMiddleware } from 'redux';
import { thunk, logger } from '../../common/js/utils/middleware';
import appReducer from './reducers/appReducer';
// import commonStore from 'common/js/store';

const middleware = [thunk];

// Remove the logger for production
if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);
}

export default createStore(appReducer, applyMiddleware(...middleware));
