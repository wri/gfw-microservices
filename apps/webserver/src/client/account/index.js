/* global classificationsData, commoditiesData, geographiesData, titlesData */

import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Account from './js/components/Account';
import { render } from 'react-dom';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    <Account
      classificationsData={classificationsData}
      commoditiesData={commoditiesData}
      geographiesData={geographiesData}
      titlesData={titlesData}
    />
  </MuiThemeProvider>
);

render(<App />, document.getElementById('account-mount'));

if (module.hot) {
  module.hot.accept();
}
