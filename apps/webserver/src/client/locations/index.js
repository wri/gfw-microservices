/* global userInfo */

import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '../styles/ThemeProvider';

import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import LocationsPage from './js/components/landing/LocationsPage';

import { NO_MESSAGE } from './js/utils/history.utils';
import './polyfills';

const App = () => (
  <ThemeProvider>
    <AppErrorFallback>
      <Router
        basename="/locations"
        getUserConfirmation={(message, callback) => {
          if (message !== NO_MESSAGE) {
            window.alert(message);
          }
          callback(false);
        }}
      >
        <LocationsPage userInfo={userInfo} />
      </Router>
    </AppErrorFallback>
  </ThemeProvider>
);

render(<App />, document.getElementById('locations-mount'));

if (module.hot) {
  module.hot.accept();
}
