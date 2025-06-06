/* global userLists, locationCount, gfwLists, userInfo, userSharedLists */

import moment from 'moment';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Map from './js/components/Map';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import store from './js/store';

// *** POPOVER ISSUE FIX ***
// there is a known issue when using material ui v<1 with React Fiber (React v16).
// the popoverPreRender file is a workaround that modifies the
// material ui Popover's prototype to delay the opening of the modal
// and get rid of the flash at position 0,0 before moving to the anchor element.
// this issue will not be fixed for material ui v<1 since v1 is a complete rebuild
// and addresses this.
// more info here https://github.com/mui-org/material-ui/issues/8040
import '../common/popoverPreRender';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';
lightBaseTheme.palette.textColor = '#555555';

Date.prototype.getJulian = function () {
  const date = moment(this);
  const year = date.year();
  const startOfYear = moment(`${year}/01/01`, 'YYYY/MM/DD');
  const daysPassed = date.diff(startOfYear, 'days');
  let daysPassedFormatted = daysPassed.toString();

  if (daysPassedFormatted.length < 3) {
    while (daysPassedFormatted.length < 3) {
      daysPassedFormatted = `0${daysPassedFormatted}`;
    }
  }
  return `${date.format('YY')}${daysPassedFormatted}`;
};

function App() {
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <AppErrorFallback>
        <Provider store={store}>
          <BrowserRouter>
            <Map
              userLists={userLists}
              locationCount={locationCount}
              gfwLists={gfwLists}
              userInfo={userInfo}
              userSharedLists={userSharedLists}
            />
          </BrowserRouter>
        </Provider>
      </AppErrorFallback>
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('map-mount'));

if (module.hot) {
  module.hot.accept();
}
