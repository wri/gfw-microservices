/* global classificationsData, commoditiesData, geographiesData, titlesData */

import { createRoot } from 'react-dom/client';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Account from './js/components/Account';

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

const container = document.getElementById('account-mount');
const root = createRoot(container);
root.render(<App />);

if (module.hot) {
  module.hot.accept();
}
