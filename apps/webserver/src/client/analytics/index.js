import React from 'react';
import { render } from 'react-dom';

import Analytics from './js/components/Analytics';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Analytics />
  </ThemeProvider>
);

render(<App />, document.getElementById('analytics-mount'));

if (module.hot) {
  module.hot.accept();
}
