import { createStore, applyMiddleware } from 'redux';
import { thunk, logger } from '../../common/js/utils/middleware';
import dashboardReducer from './reducers/dashboardReducer';

// Configure middleware
const middleware = [thunk];
// Apply logger if in development
if (process.env.NODE_ENV === 'development') {
  middleware.push(logger);
}

export default createStore(dashboardReducer, applyMiddleware(...middleware));
