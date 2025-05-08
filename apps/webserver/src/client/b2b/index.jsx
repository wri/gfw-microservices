import React from 'react';
import { render } from 'react-dom';
import './css/b2b.scss';

import Page from '../common/js/components/Page';
import B2bSharingPanel from './js/components/B2bSharingPanel';
import { ThemeProvider } from '../styles';

const pageOptions = {
  links: {
    logout: true,
  },
};

function App() {
  return (
    <ThemeProvider>
      <Page links={pageOptions.links} active="b2b">
        <B2bSharingPanel />
      </Page>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('mount'));

if (module.hot) {
  module.hot.accept();
}
