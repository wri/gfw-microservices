import { createStore, applyMiddleware } from 'redux';

// import { ENV_PROD } from '../../common/js/constants/appConstants';
import { thunk, logger } from './utils/middleware';
import appReducer from './reducers/appReducer';

const middleware = [thunk];

// Remove the logger for production
if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);
}

console.log('create common store!');

export default createStore(appReducer, applyMiddleware(...middleware));
