/* global userEmail */

import { render } from 'react-dom';
import React from 'react';

import { ThemeProvider } from '../styles';
import Change from './js/components/Change';

const App = () => (
  <ThemeProvider>
    <Change userEmail={userEmail} />
  </ThemeProvider>
);

render(<App />, document.getElementById('change-mount'));

if (module.hot) {
  module.hot.accept();
}
