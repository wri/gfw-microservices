import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Dashboard from './js/components/Dashboard';
import { render } from 'react-dom';
import React from 'react';

// *** POPOVER ISSUE FIX ***
// there is a known issue when using material ui v<1 with React Fiber (React v16).
// the popoverPreReneder file is a workaround that modifies the
// material ui Popover's prototype to delay the opening of the modal
// and get rid of the flash at position 0,0 before moving to the anchor element.
// this issue will not be fixed for material ui v<1 since v1 is a complete rebuild
// and addresses this.
// more info here https://github.com/mui-org/material-ui/issues/8040
import '../common/popoverPreRender';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
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
  </MuiThemeProvider>
);

render(<App />, document.getElementById('dashboard-mount'));
