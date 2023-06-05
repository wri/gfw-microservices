import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ChangeExist from './js/components/ChangeExist';
import { render } from 'react-dom';
import React from 'react';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    <ChangeExist userEmail={userEmail} />
  </MuiThemeProvider>
);

render(<App />, document.getElementById('changeExist-mount'));
