import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'react-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ProManagerPanel from './js/components/ProManagerPanel';
import Page from '../common/js/components/Page';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';
const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <BrowserRouter basename="/pro-manager-list">
        <Page links={pageOptions.links} active="pro-manager">
          <ProManagerPanel />
        </Page>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('proManagerList-mount'));
