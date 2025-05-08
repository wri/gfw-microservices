import React from 'react';
import { render } from 'react-dom';

import Forgot from './js/components/Forgot';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Forgot />
  </ThemeProvider>
);

render(<App />, document.getElementById('forgot-mount'));

if (module.hot) {
  module.hot.accept();
}
