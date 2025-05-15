/* global userLists, locationCount, accessLevel, subscription_status_id, gfwLists, userSharedLists, fromMap, userInfo */

import { render } from 'react-dom';
import { Provider } from 'react-redux';

import { ThemeProvider } from '../styles';
import Dashboard from './js/components/Dashboard';
import store from './js/store';

const App = () => (
  <ThemeProvider>
    <Provider store={store}>
      <Dashboard
        userLists={userLists}
        locationCount={locationCount}
        accessLevel={accessLevel}
        subscription_status_id={subscription_status_id}
        gfwLists={gfwLists}
        userSharedLists={userSharedLists}
        fromMap={fromMap}
        userInfo={userInfo}
      />
    </Provider>
  </ThemeProvider>
);

render(<App />, document.getElementById('dashboard-mount'));

if (module.hot) {
  module.hot.accept();
}
