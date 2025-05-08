import React from 'react';
import { render } from 'react-dom';
import Page from '../common/js/components/Page';
import ActivityLog from './js/components/ActivityLog';
import { ThemeProvider } from '../styles';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <Page links={pageOptions.links} active="profile">
        <ActivityLog />
      </Page>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('activity-log-mount'));

if (module.hot) {
  module.hot.accept();
}
