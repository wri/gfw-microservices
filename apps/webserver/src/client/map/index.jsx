/* global userLists, locationCount, gfwLists, userInfo, userSharedLists */

import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../styles';
import Map from './js/components/Map';
import AppErrorFallback from '../common/js/components/Errors/AppErrorFallback';
import store from './js/store';

function App() {
  return (
    <ThemeProvider>
      <AppErrorFallback>
        <Provider store={store}>
          <BrowserRouter>
            <Map
              userLists={userLists}
              locationCount={locationCount}
              gfwLists={gfwLists}
              userInfo={userInfo}
              userSharedLists={userSharedLists}
            />
          </BrowserRouter>
        </Provider>
      </AppErrorFallback>
    </ThemeProvider>
  );
}

render(<App />, document.getElementById('map-mount'));

if (module.hot) {
  module.hot.accept();
}
