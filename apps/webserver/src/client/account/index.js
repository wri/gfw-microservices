/* global classificationsData, commoditiesData, geographiesData, titlesData */

import Account from './js/components/Account';
import { render } from 'react-dom';
import React from 'react';
import { ThemeProvider } from '../styles';

const App = () => (
  <ThemeProvider>
    <Account
      classificationsData={classificationsData}
      commoditiesData={commoditiesData}
      geographiesData={geographiesData}
      titlesData={titlesData}
    />
  </ThemeProvider>
);

render(<App />, document.getElementById('account-mount'));

if (module.hot) {
  module.hot.accept();
}
