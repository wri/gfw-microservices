/* global templateData, userLists, userSharedLists, userInfo, usersList, organizationId, locationCount, gfwLists, fromMap, listStatuses */

import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import Locations from './js/components/Locations';

// *** POPOVER ISSUE FIX ***
// there is a known issue when using material ui v<1 with React Fiber (React v16).
// the popoverPreRender file is a workaround that modifies the
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
    const reader = new FileReader();

    reader.onload = function () {
      const bytes = new Uint8Array(reader.result);
      const length = bytes.byteLength;
      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      //this.result  - readonly so assign content to another property
      this.content = binary;
      this.onload();
    };
    reader.readAsArrayBuffer(fileData);
  };
}

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => {
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <AppErrorFallback>
        <BrowserRouter basename="/list-details">
          <Locations
            templateData={templateData}
            userLists={userLists} //Contains all lists that users have created
            userSharedLists={userSharedLists}
            locationCount={locationCount}
            userInfo={userInfo}
            usersList={usersList} //Contains all users
            organizationId={organizationId}
            gfwLists={gfwLists}
            listStatuses={listStatuses}
            fromMap={fromMap}
          />
        </BrowserRouter>
      </AppErrorFallback>
    </MuiThemeProvider>
  );
};

render(<App />, document.getElementById('list-details-mount'));

if (module.hot) {
  module.hot.accept();
}
