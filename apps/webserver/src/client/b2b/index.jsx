import React from 'react';
import { render } from 'react-dom';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Page from '../common/js/components/Page';
import B2bSharingPanel from './js/components/B2bSharingPanel';
import './css/b2b.scss';

lightBaseTheme.fontFamily = 'Fira Sans, sans-serif';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
      <Page links={pageOptions.links} active="b2b">
        <B2bSharingPanel />
      </Page>
    </MuiThemeProvider>
  );
}

render(<App />, document.getElementById('mount'));
