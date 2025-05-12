import React from 'react';
import { render } from 'react-dom';

import { ThemeProvider } from '../styles';
import Reset from './js/components/Reset';

const App = () => (
  <ThemeProvider>
    <Reset />
  </ThemeProvider>
);

render(<App />, document.getElementById('reset-mount'));

if (module.hot) {
  module.hot.accept();
}
