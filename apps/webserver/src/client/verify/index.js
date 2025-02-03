import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Verify from './js/components/Verify';
import { render } from 'react-dom';
import React from 'react';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    <AppErrorFallback>
      <Verify />
    </AppErrorFallback>
  </MuiThemeProvider>
);

render(<App />, document.getElementById('verify-mount'));
