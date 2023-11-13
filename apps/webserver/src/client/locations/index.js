import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Locations from './js/components/Locations';
import { NO_MESSAGE } from './js/utils/history.utils';

// *** POPOVER ISSUE FIX ***
// there is a known issue when using material ui v<1 with React Fiber (React v16).
// the popoverPreReneder file is a workaround that modifies the
// material ui Popover's prototype to delay the opening of the modal
// and get rid of the flash at position 0,0 before moving to the anchor element.
// this issue will not be fixed for material ui v<1 since v1 is a complete rebuild
// and addresses this.
// more info here https://github.com/mui-org/material-ui/issues/8040
import '../common/popoverPreRender';

if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign(target) {
      // .length of function is 2
      'use strict';
      if (target === null) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}

if (FileReader.prototype.readAsBinaryString === undefined) {
  FileReader.prototype.readAsBinaryString = function (fileData) {
    let binary = '';
    const pt = this;
    const reader = new FileReader();
    reader.onload = function (e) {
      const bytes = new Uint8Array(reader.result);
      const length = bytes.byteLength;
      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      //pt.result  - readonly so assign content to another property
      pt.content = binary;
      pt.onload(); // thanks to @Denis comment
    };
    reader.readAsArrayBuffer(fileData);
  };
}

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    <Router
      basename="/locations"
      getUserConfirmation={(message, callback) => {
        if (message !== NO_MESSAGE) {
          window.alert(message);
        }
        callback(false);
      }}
    >
      <Locations
        templateData={templateData}
        templateDropdowns={templateDropdowns}
        userLists={userLists} //Contains all lists that users have created
        userSharedLists={userSharedLists}
        locationCount={locationCount}
        userInfo={userInfo}
        usersList={usersList} //Contains all users
        organizationId={organizationId}
        orgLists={orgLists}
        gfwLists={gfwLists}
        mapData={mapData}
        gfwData={gfwData}
        goToEditList={goToEditList}
        drawData={drawData}
        locationName={locationName}
        listStatuses={listStatuses}
        fromMap={fromMap}
      />
    </Router>
  </MuiThemeProvider>
);
console.log('LOCATION/INDEX.JS: => :', userLists);
render(<App />, document.getElementById('locations-mount'));
