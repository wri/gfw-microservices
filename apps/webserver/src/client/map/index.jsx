import React from 'react';
import moment from 'moment';
import { render } from 'react-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Map from './js/components/Map';

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
lightBaseTheme.palette.textColor = '#555555';

// Modify the JS Date object
Date.prototype.getJulian = function () {
  // Convert date into moment Object
  const date = moment(this);
  // Get the year
  const year = date.year();
  // Create a moment object of the beginning of the year
  const startOfYear = moment(`${year}/01/01`, 'YYYY/MM/DD');
  // Find number of days passed
  const daysPassed = date.diff(startOfYear, 'days');
  // Append leading zeros if needed
  let daysPassedFormatted = daysPassed.toString();
  if (daysPassedFormatted.length < 3) {
    while (daysPassedFormatted.length < 3) {
      daysPassedFormatted = `0${daysPassedFormatted}`;
    }
  }
  // Return the correct Julian
  return `${date.format('YY')}${daysPassedFormatted}`;
};

function App() {
  const parsedListData = Object.keys(listData).length ? JSON.parse(listData) : {};
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <Map
        userLists={userLists}
        locationCount={locationCount}
        gfwLists={gfwLists}
        listData={parsedListData}
        userInfo={userInfo}
        userSharedLists={userSharedLists}
      />
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('map-mount'));
