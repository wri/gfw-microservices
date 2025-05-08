/* global userLists, locationCount, accessLevel, subscription_status_id, gfwLists, userSharedLists, fromMap, userInfo */
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import Dashboard from './js/components/Dashboard';
import store from './js/store';
import { ThemeProvider } from '../styles';

// *** POPOVER ISSUE FIX ***
// there is a known issue when using material ui v<1 with React Fiber (React v16).
// the popoverPreRender file is a workaround that modifies the
// material ui Popover's prototype to delay the opening of the modal
// and get rid of the flash at position 0,0 before moving to the anchor element.
// this issue will not be fixed for material ui v<1 since v1 is a complete rebuild
// and addresses this.
// more info here https://github.com/mui-org/material-ui/issues/8040

import '../common/popoverPreRender';

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
