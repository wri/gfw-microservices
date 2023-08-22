import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'react-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Page from '../common/js/components/Page';
import DiagnosticsContainer from './js/DiagnosticsContainer';
import store from '../locations/js/store';
import './css/diagnostics.scss';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';
const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <Provider store={store}>
        <BrowserRouter basename="/diagnostics">
          <Page links={pageOptions.links} active="locations">
            <DiagnosticsContainer />
          </Page>
        </BrowserRouter>
      </Provider>
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('mount'));
