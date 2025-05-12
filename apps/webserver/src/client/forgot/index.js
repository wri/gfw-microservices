import React from 'react';
import { render } from 'react-dom';

import { ThemeProvider } from '../styles';
import Forgot from './js/components/Forgot';

const App = () => (
  <ThemeProvider>
    <Forgot />
  </ThemeProvider>
);

render(<App />, document.getElementById('forgot-mount'));

if (module.hot) {
  module.hot.accept();
}
