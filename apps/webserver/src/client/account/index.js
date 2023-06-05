import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Account from './js/components/Account';
import { render } from 'react-dom';
import React from 'react';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => (
  /*eslint-disable */
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    <Account
      classificationsData={classificationsData}
      commoditiesData={commoditiesData}
      geographiesData={geographiesData}
      titlesData={titlesData}
    />
  </MuiThemeProvider>
  /*eslint-enable */
);

render(<App />, document.getElementById('account-mount'));
